// "use server";

// import { revalidatePath } from "next/cache";
// import prismadb from "@/lib/prismadb";
// import { redirect } from "next/navigation";
// import { v2 as cloudinary } from 'cloudinary';

// // ADD IMAGE
// export async function addImage({ image, userId, path }: any) {
//   try {
//     const author = await prismadb.user.findUnique({
//       where: { id: userId },
//     });

//     if (!author) {
//       throw new Error("User not found");
//     }

//     const newImage = await prismadb.image.create({
//       data: {
//         ...image,
//         authorId: author.id,
//         config: JSON.stringify(image.config)
//       },
//     });

//     revalidatePath(path);

//     return newImage;
//   } catch (error) {
//     console.error(error);
//   }
// }

// // UPDATE IMAGE
// export async function updateImage({ image, userId, path }: any) {
//   try {
//     const imageToUpdate = await prismadb.image.findUnique({
//       where: { id: image.id },
//     });

//     if (!imageToUpdate || imageToUpdate.authorId !== userId) {
//       throw new Error("Unauthorized or image not found");
//     }

//     const updatedImage = await prismadb.image.update({
//       where: { id: image.id },
//       data: image,
//     });

//     revalidatePath(path);

//     return updatedImage;
//   } catch (error) {
//     console.error(error);
//   }
// }

// // DELETE IMAGE
// export async function deleteImage(imageId: string) {
//   try {
//     await prismadb.image.delete({
//       where: { id: imageId },
//     });
//   } catch (error) {
//     console.error(error);
//   } finally {
//     redirect('/');
//   }
// }

// // GET IMAGE
// export async function getImageById(imageId: string) {

//   try {
//     const image = await prismadb.image.findUnique({
//       where: { id: imageId },
//       include: { author: true },
//     });

//     if (!image) throw new Error("Image not found");

//     return image;
//   } catch (error) {
//     console.error(error);
//   }
// }

// // GET IMAGES
// export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
//   limit?: number;
//   page: number;
//   searchQuery?: string;
// }) {
//   try {
//     cloudinary.config({
//       cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//       secure: true,
//     });

//     let expression = 'folder=imaginify';

//     if (searchQuery) {
//       expression += ` AND ${searchQuery}`;
//     }

//     const { resources } = await cloudinary.search
//       .expression(expression)
//       .execute();

//     const resourceIds = resources.map((resource: any) => resource.public_id);

//     let whereClause = {};

//     if (searchQuery) {
//       whereClause = {
//         publicId: { in: resourceIds },
//       };
//     }

//     const skipAmount = (Number(page) - 1) * limit;

//     const images = await prismadb.image.findMany({
//       where: whereClause,
//       include: { author: true },
//       orderBy: { updatedAt: 'desc' },
//       skip: skipAmount,
//       take: limit,
//     });

//     const totalImages = await prismadb.image.count({
//       where: whereClause,
//     });
//     const savedImages = await prismadb.image.count();

//     return {
//       data: images,
//       totalPage: Math.ceil(totalImages / limit),
//       savedImages,
//     };
//   } catch (error) {
//     console.error(error);
//   }
// }

// // GET IMAGES BY USER
// export async function getUserImages({
//   limit = 9,
//   page = 1,
//   userId,
// }: {
//   limit?: number;
//   page: number;
//   userId: string;
// }) {
//   try {
//     const skipAmount = (Number(page) - 1) * limit;

//     const images = await prismadb.image.findMany({
//       where: { authorId: userId },
//       include: { author: true },
//       orderBy: { updatedAt: 'desc' },
//       skip: skipAmount,
//       take: limit,
//     });

//     const totalImages = await prismadb.image.count({
//       where: { authorId: userId },
//     });

//     return {
//       data: images,
//       totalPages: Math.ceil(totalImages / limit),
//     };
//   } catch (error) {
//     console.error(error);
//   }
// }
