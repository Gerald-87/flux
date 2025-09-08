import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent } from '../../ui/Card';
import { PageHeader } from '../../ui/PageHeader';
import { vendorService, PricingPlan } from '../../../services/vendorService';
import { PricingPlanModal } from '../modals/PricingPlanModal';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [currentPage]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getPricingPlans({
        page: currentPage,
        limit: 10
      });
      setPlans(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
      toast.error('Failed to load pricing plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      await vendorService.deletePricingPlan(planId);
      await fetchPlans();
      toast.success('Pricing plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete pricing plan');
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  return (
    <div>
      <PageHeader title="Pricing Plans" subtitle={`Manage all ${total} pricing plans.`}>
        <div className="flex items-center space-x-4">
          <Button onClick={() => {
            setSelectedPlan(null);
            setShowPlanModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={cn(
              "relative overflow-hidden",
              !plan.isActive && "opacity-60"
            )}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-center mt-1">
                      {plan.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span className={cn(
                        "text-sm",
                        plan.isActive ? "text-green-600" : "text-gray-500"
                      )}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPlanModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">/{plan.duration} days</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {plan.duration} days
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatPrice(plan.price)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {plans.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing plans</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first pricing plan.</p>
            <Button onClick={() => {
              setSelectedPlan(null);
              setShowPlanModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      )}
      
      <PricingPlanModal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setSelectedPlan(null);
        }}
        onSuccess={fetchPlans}
        plan={selectedPlan}
      />
    </div>
  );
}
