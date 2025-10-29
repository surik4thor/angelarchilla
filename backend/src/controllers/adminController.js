import prisma from '../config/database.js';
import { notifyDiscord } from '../utils/discordNotify.js';

export const getStats = async (req, res) => {
  const userCount = await prisma.user.count();
  const readingCount = await prisma.reading.count();
  res.json({ users: userCount, readings: readingCount });
};

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      createdAt: true
    }
  });
  res.json({ users });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { subscriptionPlan, subscriptionStatus } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { subscriptionPlan, subscriptionStatus }
  });
  try { notifyDiscord('suscripciones', `Cambio de suscripción: ${user.email} -> plan=${user.subscriptionPlan} status=${user.subscriptionStatus}`); } catch (e) { console.error('notify discord subscription change error', e); }
  res.json({ user });
};
