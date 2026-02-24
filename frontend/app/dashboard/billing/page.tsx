'use client';

import { useEffect, useState } from 'react';
import { subscriptionService } from '@/lib/services';
import { SubscriptionPlan, TenantSubscription } from '@/types';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'アクティブ', color: 'bg-emerald-100 text-emerald-700' },
  TRIALING: { label: 'トライアル中', color: 'bg-blue-100 text-blue-700' },
  PAST_DUE: { label: '支払い遅延', color: 'bg-amber-100 text-amber-700' },
  CANCELED: { label: 'キャンセル済み', color: 'bg-gray-100 text-gray-600' },
};

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<TenantSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrent(),
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const origin = window.location.origin;
      const { url } = await subscriptionService.createCheckout(
        planId,
        `${origin}/dashboard/billing?success=true`,
        `${origin}/dashboard/billing?canceled=true`,
      );
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'チェックアウトに失敗しました');
      setCheckoutLoading(null);
    }
  };

  const handleManagePortal = async () => {
    setPortalLoading(true);
    try {
      const origin = window.location.origin;
      const { url } = await subscriptionService.getPortalUrl(
        `${origin}/dashboard/billing`,
      );
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ポータルへのアクセスに失敗しました');
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) =>
    currentSubscription?.planId === planId;

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  const statusInfo = currentSubscription
    ? STATUS_LABELS[currentSubscription.status] ?? STATUS_LABELS.CANCELED
    : null;

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl font-bold text-gray-900">課金・プラン管理</h2>
        <p className="mt-1 text-sm text-gray-500">
          ご利用中のプランと課金情報を管理します
        </p>
      </div>

      {/* 現在のプラン */}
      {currentSubscription && (
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-8"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF' }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: '#2563EB' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">現在のプラン</span>
          </div>

          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentSubscription.plan?.name ?? 'プラン不明'}
                  </h3>
                  {statusInfo && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  )}
                </div>
                {currentSubscription.plan && (
                  <p className="text-2xl font-bold text-indigo-600">
                    ¥{currentSubscription.plan.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/月</span>
                  </p>
                )}
                {currentSubscription.currentPeriodEnd && (
                  <p className="text-xs text-gray-500 mt-1">
                    次回更新日:{' '}
                    {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
              <button
                onClick={handleManagePortal}
                disabled={portalLoading}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    移動中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    プランを管理
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プラン一覧 */}
      {plans.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            利用可能なプラン
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.id);
              const isLoadingThis = checkoutLoading === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isCurrent
                      ? 'border-indigo-400 ring-2 ring-indigo-200'
                      : 'border-gray-100 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div className="px-5 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-gray-900">{plan.name}</h4>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          現在のプラン
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ¥{plan.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/月</span>
                    </div>

                    {plan.features && Object.keys(plan.features).length > 0 && (
                      <ul className="space-y-2 mb-5">
                        {Object.entries(plan.features).map(([key, value]) => (
                          <li key={key} className="flex items-start text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                              {key}: {String(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => !isCurrent && handleUpgrade(plan.id)}
                      disabled={isCurrent || isLoadingThis || !plan.isActive}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.isActive
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {isLoadingThis ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          処理中...
                        </>
                      ) : isCurrent ? (
                        '現在のプラン'
                      ) : !plan.isActive ? (
                        '準備中'
                      ) : (
                        'このプランにアップグレード'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!currentSubscription && plans.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">プランが利用できません</h3>
          <p className="text-xs text-gray-500">管理者にお問い合わせください</p>
        </div>
      )}
    </div>
  );
}
