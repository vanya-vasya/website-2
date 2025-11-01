"use server";

// import { redirect } from 'next/navigation';
// import Stripe from "stripe";
// import { handleError } from '../utils';
// import prismadb from "@/lib/prismadb";
// import { updateCredits } from './user.actions';



// CHECKOUT CREDITS
// export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // const amount = Number(transaction.amount) * 100;

  // const session = await stripe.checkout.sessions.create({
  //   line_items: [
  //     {
  //       price_data: {
  //         currency: 'usd',
  //         unit_amount: amount,
  //         product_data: {
  //           name: transaction.plan,
  //         }
  //       },
  //       quantity: 1
  //     }
  //   ],
  //   metadata: {
  //     plan: transaction.plan,
  //     credits: transaction.credits,
  //     buyerId: transaction.buyerId,
  //   },
  //   mode: 'payment',
  //   success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  // });

  // redirect(session.url!);
// }

// CREATE TRANSACTION
// export async function createTransaction(transaction: CreateTransactionParams) {
//   try {
//     const buyerId = parseInt(transaction.buyerId, 10);
//     // Create a new transaction
//     const newTransaction = await prismadb.transaction.create({
//       data: {
//         stripeId: transaction.stripeId,
//         amount: transaction.amount,
//         plan: transaction.plan,
//         credits: transaction.credits,
//         buyerId: buyerId,
//       },
//     });

//     await updateCredits(transaction.buyerId, transaction.credits ?? 0);

//     return newTransaction;
//   } catch (error) {
//     handleError(error);
//   }
// }
