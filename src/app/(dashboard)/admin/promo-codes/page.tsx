import { prisma } from '@/lib/db';
import { PromoCodeForm } from '@/components/admin/PromoCodeForm';
import { PromoCodeList } from '@/components/admin/PromoCodeList';

export default async function AdminPromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          redemptions: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Promo Codes</h2>
        <p className="text-gray-400">Create and manage promotional codes for tier upgrades</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PromoCodeForm />
        </div>
        <div className="lg:col-span-2">
          <PromoCodeList promoCodes={promoCodes} />
        </div>
      </div>
    </div>
  );
}



