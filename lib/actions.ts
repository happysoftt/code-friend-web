"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UTApi } from "uploadthing/server";
import bcrypt from "bcryptjs";
import { sendOrderApprovedEmail } from "@/lib/mail";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------
// 1. AUTH & USER MANAGEMENT
// ---------------------------------------------------------

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (password.length < 6) return { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "อีเมลนี้ถูกใช้งานแล้ว" };

    let userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: "USER", description: "General Member" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        profile: {
          create: {
            bio: "สมาชิกใหม่",
            stack: "Learner",
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "เกิดข้อผิดพลาดร้ายแรง โปรดลองใหม่ภายหลัง" };
  }
}

export async function adminResetPassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (newPassword.length < 6) return { error: "รหัสผ่านต้องยาว 6 ตัวขึ้นไป" };

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    return { error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" };
  }
}

export async function updateUserRole(userId: string, roleName: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    let role = await prisma.role.findFirst({ where: { name: roleName } });
    
    if (!role) {
        role = await prisma.role.create({
            data: { 
                name: roleName, 
                description: roleName === "ADMIN" ? "Administrator" : "General User" 
            }
        });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id }
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };

  } catch (error) {
    console.error("Update Role Error:", error);
    return { error: "Failed to update role" };
  }
}

export async function toggleUserStatus(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}
export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    if (!name || !slug) {
      return { error: "กรุณากรอกชื่อและ Slug ให้ครบถ้วน" };
    }

    // อัปเดตข้อมูลลง Database
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    // รีเฟรชหน้าหมวดหมู่เพื่อให้ข้อมูลอัปเดตทันที
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    
    return { success: true };

  } catch (error) {
    console.error("Update Category Error:", error);
    return { error: "เกิดข้อผิดพลาด (ชื่อหรือ Slug อาจซ้ำกับที่มีอยู่)" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "ลบหมวดหมู่ไม่สำเร็จ (อาจมีสินค้าอยู่ในหมวดหมู่นี้)" };
  }
}
export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "ลบผู้ใช้งานไม่สำเร็จ (อาจมีประวัติการสั่งซื้อค้างอยู่)" };
  }
}

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const website = formData.get("website") as string;
  const github = formData.get("github") as string;
  const facebook = formData.get("facebook") as string;
  const imageFile = formData.get("image") as File;

  try {
    const dataToUpdateUser: any = { name };

    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      dataToUpdateUser.image = upload.data.url;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdateUser,
    });

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio,
        website,
        github,
        facebook,
      },
      update: {
        bio,
        website,
        github,
        facebook,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "อัปเดตโปรไฟล์ไม่สำเร็จ" };
  }
}

// ---------------------------------------------------------
// 2. PRODUCT & STORE MANAGEMENT
// ---------------------------------------------------------

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "สิทธิ์ไม่เพียงพอ" };

  const nameValue = (formData.get("title") || formData.get("name")) as string;
  if (!nameValue) return { error: "กรุณาระบุชื่อสินค้า" };

  const slug = slugify(nameValue, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const isFree = formData.get("isFree") === "true" || formData.get("isFree") === "on";
  const categoryId = formData.get("categoryId") as string;
  const downloadUrl = (formData.get("downloadUrl") || formData.get("fileUrl")) as string;
  const imageFile = formData.get("image") as File;
  const productFile = formData.get("file") as File;
  
  let finalFileUrl = downloadUrl;

  try {
    if (productFile && productFile.size > 0) {
      const upload = await utapi.uploadFiles(productFile); 
      if (upload.error) throw new Error(upload.error.message);
      finalFileUrl = upload.data.url;
    }

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      imageUrl = upload.data.url;
    }

    const product = await prisma.product.create({
      data: {
        title: nameValue,
        slug,
        description,
        price,
        isFree,
        image: imageUrl,
        fileUrl: finalFileUrl,
        categoryId: categoryId || null,
        isActive: true,
      },
    });

    const version = formData.get("version") as string;
    if (version) {
      await prisma.downloadResource.create({
        data: {
          version: version,
          fileUrl: finalFileUrl,
          productId: product.id,
        },
      });
    }

    revalidatePath("/admin/store");
    revalidatePath("/store");
    return { success: true };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { error: "ไม่สามารถสร้างสินค้าได้: " + (error as Error).message };
  }
}

export async function updateProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const title = (formData.get("title") || formData.get("name")) as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const isFree = formData.get("isFree") === "true" || formData.get("isFree") === "on";
  const categoryId = formData.get("categoryId") as string;
  const downloadUrl = (formData.get("downloadUrl") || formData.get("fileUrl")) as string;
  const imageFile = formData.get("image") as File;

  try {
    const dataToUpdate: any = {
      title,
      description,
      price,
      isFree,
      categoryId: categoryId || null,
    };

    if (downloadUrl) dataToUpdate.fileUrl = downloadUrl;

    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      dataToUpdate.image = upload.data.url;
    }

    await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/store");
    revalidatePath("/store");
    return { success: true };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { error: "แก้ไขสินค้าไม่สำเร็จ" };
  }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "สิทธิ์ไม่เพียงพอ" };

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/store");
    revalidatePath("/store");
    return { success: true };
  } catch (error) {
    return { error: "ลบสินค้าไม่สำเร็จ (อาจมีคำสั่งซื้อค้างอยู่)" };
  }
}

export async function getProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return { ...product, price: Number(product.price) };
  } catch (error) {
    return null;
  }
}

export async function incrementProductView(productId: string) {
  try {
    const cookieStore = await cookies();
    const cookieName = `viewed_${productId}`;
    const hasViewed = cookieStore.get(cookieName);

    if (hasViewed) return;

    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });

    cookieStore.set(cookieName, "true", {
      maxAge: 60 * 60, 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

  } catch (error) {
    console.error("View Count Error:", error);
  }
}

export async function trackDownload(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    await prisma.$transaction([
        prisma.product.update({
            where: { id: productId },
            data: { downloadCount: { increment: 1 } }
        }),
        prisma.downloadHistory.create({
            data: {
                productId: productId,
                userId: session?.user?.id || "", 
                // Note: ถ้าไม่มี user อาจต้องแก้ schema ให้ userId เป็น optional หรือ handle กรณี guest
            }
        })
    ]);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Log failed" };
  }
}

// ---------------------------------------------------------
// 3. ORDER & PAYMENT
// ---------------------------------------------------------

export async function createOrder(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "Product not found" };

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        total: product.price,
        status: "WAITING_VERIFY",
        paymentRef: "ORD-" + uuidv4().slice(0, 8).toUpperCase(),
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    return { error: "Transaction failed" };
  }
}

export async function submitPaymentSlip(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const slipFile = formData.get("slip") as File;
  
  if (!slipFile || slipFile.size === 0) return { error: "กรุณาแนบสลิปโอนเงิน" };

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "Product not found" };

    const upload = await utapi.uploadFiles(slipFile);
    if (upload.error) throw new Error(upload.error.message);
    const slipUrl = upload.data.url;

    await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        total: product.price,
        status: "WAITING_VERIFY",
        slipUrl: slipUrl,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Slip Upload Error:", error);
    return { error: "บันทึกสลิปไม่สำเร็จ" };
  }
}

export async function approveOrder(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      include: { user: true, product: true },
    });

    const licenseKey = `KEY-${uuidv4().toUpperCase().slice(0, 18)}`;
    await prisma.licenseKey.create({
      data: {
        key: licenseKey,
        orderId: order.id,
        productId: order.productId,
      },
    });

    if (order.user.email) {
      await sendOrderApprovedEmail(
        order.user.email,
        order.user.name || "Customer",
        order.product.title,
        order.id
      );
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "อนุมัติไม่สำเร็จ" };
  }
}

export async function rejectOrder(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { error: "ปฏิเสธไม่สำเร็จ" };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update order" };
  }
}

// ---------------------------------------------------------
// 4. ARTICLE & CONTENT
// ---------------------------------------------------------

export async function createArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const imageFile = formData.get("image") as File;

  if (!title || !content) return { error: "กรุณากรอกข้อมูลให้ครบ" };

  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);

  try {
    let coverImage = null;
    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      coverImage = upload.data.url;
    }

    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "General", slug: "general" },
      });
    }

    await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published: true,
        authorId: session.user.id,
        categoryId: category.id,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "บันทึกบทความไม่สำเร็จ" };
  }
}

export async function updateArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImage = formData.get("coverImage") as File;

  try {
    const dataToUpdate: any = { title, content };

    if (coverImage && coverImage.size > 0) {
      const upload = await utapi.uploadFiles(coverImage);
      if (upload.error) throw new Error(upload.error.message);
      dataToUpdate.coverImage = upload.data.url;
    }

    await prisma.article.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    return { error: "แก้ไขไม่สำเร็จ" };
  }
}

export async function deleteArticle(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  try {
    await prisma.article.delete({ where: { id } });
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete article" };
  }
}

// ---------------------------------------------------------
// 5. LEARNING PATH & LESSONS
// ---------------------------------------------------------

export async function createLearningPath(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File;

  if (!title) return { error: "กรุณาระบุชื่อคอร์ส" };

  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);

  try {
    let thumbnail = null;
    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      thumbnail = upload.data.url;
    }

    const newCourse = await prisma.learningPath.create({
      data: {
        title,
        slug,
        description,
        thumbnail,
        published: true,
      },
    });

    console.log("✅ สร้างคอร์สสำเร็จ:", newCourse.id);

    revalidatePath("/admin/learn");
    revalidatePath("/learn"); 

    return { success: true };
  } catch (error) {
    console.error("❌ Create Learning Path Error:", error);
    return { error: "สร้างคอร์สไม่สำเร็จ: " + (error as Error).message };
  }
}

export async function updateLearningPath(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const published = formData.get("published") === "true";
  const imageFile = formData.get("image") as File;

  try {
    const dataToUpdate: any = {
      title,
      description,
      published,
    };

    if (imageFile && imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile);
      if (upload.error) throw new Error(upload.error.message);
      dataToUpdate.thumbnail = upload.data.url;
    }

    await prisma.learningPath.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/learn");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update course" };
  }
}

export async function deleteLearningPath(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  try {
    await prisma.learningPath.delete({ where: { id } });
    revalidatePath("/admin/learn");
    revalidatePath("/learn");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete learning path" };
  }
}

export async function createLesson(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const content = formData.get("content") as string;
  

  const duration = parseInt(formData.get("duration") as string) || 0;

  if (!title || !courseId) return { error: "ข้อมูลไม่ครบถ้วน" };


  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);

  try {
    const lastLesson = await prisma.lesson.findFirst({
      where: { learningPathId: courseId },
      orderBy: { order: "desc" },
    });
    const newOrder = (lastLesson?.order || 0) + 1;

    await prisma.lesson.create({
      data: {
        title,
        slug,
        content,
        videoUrl,
        order: newOrder,
        learningPathId: courseId,
        duration: duration, 
      },
    });

    
    revalidatePath(`/admin/learn/${courseId}`);
    revalidatePath("/learn"); 
    
    return { success: true };
  } catch (error) {
    console.error("❌ Create Lesson Error:", error);
    return { error: "เพิ่มบทเรียนไม่สำเร็จ" };
  }
}

export async function updateLesson(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const content = formData.get("content") as string;
  const order = parseInt(formData.get("order") as string);

  try {
    await prisma.lesson.update({
      where: { id },
      data: { title, videoUrl, content, order },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  try {
    await prisma.lesson.delete({ where: { id: lessonId } });
    revalidatePath(`/admin/learn/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "ลบไม่สำเร็จ" };
  }
}

// ---------------------------------------------------------
// 6. COMMUNITY (SHOWCASE, SNIPPET, COMMENT)
// ---------------------------------------------------------

export async function submitShowcase(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "กรุณาล็อกอินก่อน" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const demoUrl = formData.get("demoUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const imageFile = formData.get("image") as File;

  if (!title || !imageFile) return { error: "กรุณากรอกข้อมูลให้ครบ" };

  try {
    let imageUrl = "";
    if (imageFile.size > 0) {
      const upload = await utapi.uploadFiles(imageFile); 
    if (upload.error) throw new Error(upload.error.message);
    const imageUrl = upload.data.url;
    }

    await prisma.showcase.create({
      data: {
        title,
        description,
        image: imageUrl,
        demoUrl,
        githubUrl,
        userId: session.user.id,
        approved: false,
      },
    });

    const count = await prisma.showcase.count({ where: { userId: session.user.id } });
    if (count === 1) await checkAndAwardBadges(session.user.id, "FIRST_SHOWCASE");

    revalidatePath("/showcase");
    return { success: true };
  } catch (error) {
    return { error: "ส่งผลงานไม่สำเร็จ" };
  }
}

export async function approveShowcase(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  await prisma.showcase.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/showcase");
  return { success: true };
}

export async function deleteShowcase(id: string) {
  await prisma.showcase.delete({ where: { id } });
  revalidatePath("/admin/showcase");
  revalidatePath("/showcase");
  return { success: true };
}

export async function toggleShowcaseLike(showcaseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const existingLike = await prisma.showcaseLike.findUnique({
      where: { userId_showcaseId: { userId, showcaseId } }
    });

    if (existingLike) {
      await prisma.showcaseLike.delete({ where: { id: existingLike.id } });
      revalidatePath(`/showcase/${showcaseId}`);
      return { liked: false };
    } else {
      await prisma.showcaseLike.create({ data: { userId, showcaseId } });
      revalidatePath(`/showcase/${showcaseId}`);
      return { liked: true };
    }
  } catch (error) {
    return { error: "Failed to toggle like" };
  }
}

export async function incrementDemoClick(showcaseId: string) {
  try {
    await prisma.showcase.update({
      where: { id: showcaseId },
      data: { demoClicks: { increment: 1 } }
    });
    return { success: true };
  } catch (error) {
    console.error(error);
  }
}

export async function createSnippet(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const language = formData.get("language") as string;
  const code = formData.get("code") as string;

  if (!title || !code) return { error: "กรุณากรอกข้อมูลให้ครบ" };
  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);

  try {
    const snippet = await prisma.snippet.create({
      data: {
        title,
        slug,
        language,
        description,
        isPublic: true,
        approved: false,
        authorId: session.user.id,
      },
    });

    await prisma.snippetVersion.create({
      data: {
        version: "1.0.0",
        code: code,
        snippetId: snippet.id,
      },
    });

    const count = await prisma.snippet.count({ where: { authorId: session.user.id } });
    if (count >= 10) await checkAndAwardBadges(session.user.id, "SNIPPET_10");

    revalidatePath("/snippets");
    return { success: true };
  } catch (error) {
    return { error: "สร้าง Snippet ไม่สำเร็จ" };
  }
}

export async function approveSnippet(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  await prisma.snippet.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/snippets");
  return { success: true };
}

export async function deleteSnippet(id: string) {
  await prisma.snippet.delete({ where: { id } });
  revalidatePath("/snippets");
  return { success: true };
}

export async function createComment(data: {
  content: string;
  articleId?: string;
  showcaseId?: string;
  snippetId?: string;
  learningPathId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น" };

    const { content, articleId, showcaseId, snippetId, learningPathId } = data;
    if (!content || content.trim() === "") return { error: "กรุณาพิมพ์ข้อความ" };

    // 1. บันทึกคอมเมนต์ลง Database
    await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        ...(articleId && { articleId }),
        ...(showcaseId && { showcaseId }),
        ...(snippetId && { snippetId }),
        ...(learningPathId && { learningPathId }),
      },
    });

    // 2. ระบบแจ้งเตือน (ตัวอย่างสำหรับ Snippet)
    if (snippetId) {
        const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
        // ✅ แก้ไขตรงนี้: เปลี่ยนจาก userId เป็น authorId
        if (snippet && snippet.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              type: "COMMENT",
              message: `${session.user.name} คอมเมนต์ในโค้ดของคุณ: "${content.substring(0, 20)}..."`,
              link: `/snippets/${snippet.slug}`,
              userId: snippet.authorId, // ✅ เปลี่ยนตรงนี้ด้วย
            },
          });
        }
    }

    // 3. เพิ่มแต้มความดี (XP) ให้ผู้คอมเมนต์
    await prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: 10 } },
    });

    // 4. ล้าง Cache เพื่อให้คอมเมนต์ใหม่แสดงผลทันที
    if (showcaseId) revalidatePath(`/showcase/${showcaseId}`);
    if (articleId) revalidatePath(`/articles/${articleId}`);
    if (snippetId) revalidatePath(`/snippets/${snippetId}`);
    
    if (learningPathId) {
        const course = await prisma.learningPath.findUnique({ 
            where: { id: learningPathId },
            select: { slug: true }
        });
        if (course) revalidatePath(`/learn/${course.slug}`);
    }

    return { success: true };

  } catch (error) {
    console.error("Create Comment Error:", error);
    return { error: "เกิดข้อผิดพลาดในการส่งความคิดเห็น" };
  }
}


// Alias for backwards compatibility if needed, or remove if unused
export const postComment = async (formData: FormData) => {
    const content = formData.get("content") as string;
    const articleId = formData.get("articleId") as string;
    const showcaseId = formData.get("showcaseId") as string;
    const snippetId = formData.get("snippetId") as string;
    const learningPathId = formData.get("learningPathId") as string;
    
    return createComment({ content, articleId, showcaseId, snippetId, learningPathId });
};

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { error: "ไม่พบคอมเมนต์" };

    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "คุณไม่มีสิทธิ์ลบคอมเมนต์นี้" };
    }

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "ลบไม่สำเร็จ" };
  }
}

// ---------------------------------------------------------
// 7. SYSTEM & CONFIG
// ---------------------------------------------------------

export async function getMyNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];
  return await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  revalidatePath("/");
}

export async function checkAndAwardBadges(userId: string, criteria: string) {
  const badge = await prisma.badge.findFirst({ where: { criteria } });
  if (!badge) return;

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existing) return;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      message: `ยินดีด้วย! คุณได้รับตราเกียรติยศ: ${badge.name}`,
      link: "/dashboard",
    },
  });
}

export async function createCategory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "สิทธิ์ไม่เพียงพอ" };

  const name = formData.get("name") as string;
  const slug = slugify(name, { lower: true, strict: true });

  try {
    await prisma.category.create({ data: { name, slug } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "ชื่อหมวดหมู่นี้อาจจะมีอยู่แล้ว" };
  }
}



export async function updateSystemConfig(data: any) {
  try {
    await prisma.systemConfig.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save settings" };
  }
}

export async function getSystemConfig() {
  const config = await prisma.systemConfig.findUnique({
    where: { id: "default" },
  });
  
  return config || {
    siteName: "Code Friend",
    description: "",
    announceEnabled: true,
    announceText: "",
    maintenanceMode: false,
    registrationEnabled: true,
    promptpayId: "",
    promptpayName: "",
  };
}

export async function getTopRankers() {
  return await prisma.user.findMany({
    orderBy: [{ level: "desc" }, { xp: "desc" }],
    take: 10,
    where: {
        role: { name: "USER" },
        isActive: true
    },
    select: {
      id: true,
      name: true,
      image: true,
      level: true,
      xp: true,
      _count: {
        select: {
          snippets: true,
          showcases: true,
        },
      },
    },
  });
}
// ------------------------------------------
// 11. PASSWORD RESET SYSTEM
// ------------------------------------------

// 1. ขอรีเซ็ต (ส่งอีเมล)
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "ไม่พบอีเมลนี้ในระบบ" };

    // ถ้า user สมัครผ่าน Google จะไม่มี password
    if (!user.password) return { error: "บัญชีนี้ล็อกอินผ่าน Google โปรดใช้ปุ่ม Google Login" };

    // สร้าง Token (หมดอายุใน 1 ชั่วโมง)
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    // บันทึก Token ลง DB
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // ส่งอีเมล (แก้ Link ให้ตรงกับเว็บจริงตอน Deploy)
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    await resend.emails.send({
      from: 'Code Friend <noreply@resend.dev>', // หรือ domain ที่คุณ verify กับ resend
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - Code Friend',
      html: `
        <h1>รีเซ็ตรหัสผ่าน</h1>
        <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสใหม่:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">ตั้งรหัสผ่านใหม่</a>
        <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "ส่งอีเมลไม่สำเร็จ" };
  }
}

// 2. ตั้งรหัสใหม่ (Verify Token)
export async function resetPassword(token: string, newPassword: string) {
  try {
    // หา Token ใน DB
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!existingToken) return { error: "ลิงก์ไม่ถูกต้องหรือถูกใช้งานไปแล้ว" };

    // เช็ควันหมดอายุ
    if (new Date() > existingToken.expires) {
      await prisma.verificationToken.delete({ where: { token } });
      return { error: "ลิงก์หมดอายุแล้ว กรุณาขอใหม่" };
    }

    // Hash รหัสใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดต User
    await prisma.user.update({
      where: { email: existingToken.identifier },
      data: { password: hashedPassword },
    });

    // ลบ Token ทิ้ง
    await prisma.verificationToken.delete({ where: { token } });

    return { success: true };
  } catch (error) {
    return { error: "รีเซ็ตรหัสผ่านไม่สำเร็จ" };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return;

    await prisma.notification.update({
      where: { id: notificationId, userId: session.user.id }, // เช็ค userId ด้วยเพื่อความปลอดภัย
      data: { isRead: true }
    });
    
    revalidatePath("/"); // รีเฟรชข้อมูล
    return { success: true };
  } catch (error) {
    return { error: "Failed to update" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return;

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update all" };
  }
}