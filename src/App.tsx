import React, { useState } from 'react';
import { LeanSystemProvider } from './context/LeanSystemContext';
import { Navbar, TabType } from './components/layout/Navbar';
import { ShopfloorModule } from './components/shopfloor/ShopfloorModule';
import { OrdersManagementModule } from './components/orders/OrdersManagementModule';
import { PricingBOMModule } from './components/pricing/PricingBOMModule';
import { InventoryKardexModule } from './components/inventory/InventoryKardexModule';
import { CostSettingsModal } from './components/costSettings/CostSettingsModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('shopfloor');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#4A2013] flex flex-col justify-between selection:bg-[#B85324] selection:text-white pb-16 md:pb-0">
      <div>
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
        />

        <main className="animate-fadeIn">
          {activeTab === 'shopfloor' && <ShopfloorModule />}
          {activeTab === 'orders' && (
            <OrdersManagementModule onIrParaChaoDeFabrica={() => setActiveTab('shopfloor')} />
          )}
          {activeTab === 'pricing' && <PricingBOMModule />}
          {activeTab === 'inventory' && <InventoryKardexModule />}
        </main>
      </div>

      {/* Footer Industrial Di' Linhas */}
      <footer className="mt-12 border-t border-[#B85324]/15 bg-white py-6 px-4 text-center text-xs text-[#4A2013]/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-brand font-bold text-[#4A2013]">DI' LINHAS</span>
            <span>—</span>
            <span>Sistema de Produção Enxuta (Lean MES & ERP Industrial)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Metodologia Lean 4 Etapas</span>
            <span>•</span>
            <span>BOM Dinâmica & Taxa Horária Absorvida</span>
            <span>•</span>
            <span>Supabase Cloud JIT</span>
          </div>
        </div>
      </footer>

      {/* Modal de Configuração de Custos */}
      <CostSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <LeanSystemProvider>
      <AppContent />
    </LeanSystemProvider>
  );
}

export default App;
