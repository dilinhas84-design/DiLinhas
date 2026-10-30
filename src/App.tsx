import React, { useState } from 'react';
import { LeanSystemProvider } from './context/LeanSystemContext';
import { Navbar, TabType } from './components/layout/Navbar';
import { ShopfloorModule } from './components/shopfloor/ShopfloorModule';
import { OrdersManagementModule } from './components/orders/OrdersManagementModule';
import { PricingBOMModule } from './components/pricing/PricingBOMModule';
import { InventoryKardexModule } from './components/inventory/InventoryKardexModule';
import { RegistrationsHubModule } from './components/registrations/RegistrationsHubModule';
import { CostSettingsModal } from './components/costSettings/CostSettingsModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('shopfloor');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#4A2013] flex flex-col justify-between selection:bg-[#B85324] selection:text-white pb-16 lg:pb-0">
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
          {activeTab === 'registrations' && <RegistrationsHubModule />}
          {activeTab === 'pricing' && <PricingBOMModule />}
          {activeTab === 'inventory' && <InventoryKardexModule />}
        </main>
      </div>

      {/* Footer Industrial Di' Linhas */}
      <footer className="mt-12 border-t border-[#B85324]/15 bg-white py-6 px-4 text-center text-xs text-[#4A2013]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-dilinhas.png" 
              alt="Di' Linhas Logo" 
              className="h-9 w-auto object-contain" 
            />
            <div className="text-left">
              <span className="font-brand font-black text-[#4A2013] text-sm block">DI' LINHAS</span>
              <span className="text-[10px] text-[#B85324] font-semibold uppercase tracking-wider">
                Projetos Criativos • Lean MES & ERP
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium">
            <span className="px-2.5 py-1 rounded-full bg-[#FAF6EE] border border-[#B85324]/20 text-[#4A2013]">
              Metodologia Lean 4 Etapas
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF6EE] border border-[#B85324]/20 text-[#4A2013]">
              BOM Dinâmica & Taxa Horária Absorvida
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF6EE] border border-[#B85324]/20 text-[#4A2013]">
              Gestão Visual com Fotos
            </span>
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
