import { prisma } from "../../prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  createPayment,
  verifyPayment,
} from "../common_urls/payment.service.js";

export async function createCourseOrder(userId, courseId) {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });

  if (!course) throw new ApiError(404, "Course not found");
  if (!course.price || Number(course.price) === 0) {
    throw new ApiError(400, "Free courses do not require payment");
  }

  const payment = await createPayment({
    userId,
    amount: course.price,
    currency: "INR",
    billingCycle: "LIFETIME",
    paymentType: "COURSE",
    referenceId: courseId,
    metadata: { courseId },
  });

  return {
    clientSecret: payment.clientSecret,
    amount: payment.amount,
    currency: payment.currency,
    courseName: course.title,
  };
}

export async function verifyCoursePayment(userId, { paymentIntentId }, courseId) {
  await verifyPayment(paymentIntentId);

  const existingEnrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId: Number(userId), courseId: Number(courseId) },
    },
  });

  if (existingEnrollment) return existingEnrollment;

  const enrollment = await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: "SUCCESS" },
    });

    return tx.courseEnrollment.create({
      data: {
        userId: Number(userId),
        courseId: Number(courseId),
        billingCycle: "LIFETIME",
      },
    });
  });

  return enrollment;
}
