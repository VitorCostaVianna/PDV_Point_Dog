import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Users, Dog } from 'lucide-react';

export function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: ShoppingCart, label: 'PDV / Vendas' },
        { path: '/clientes', icon: Users, label: 'Clientes & Histórico' },
    ];

    return (
        <div className="w-20 bg-[#F28322] h-screen flex flex-col items-center py-6 shadow-xl z-50">
            
            {}
            <div className="mb-8 p-2 bg-white rounded-full shadow-lg">
                {}
                <Dog size={32} className="text-[#F28322]" />
            </div>
            
            <nav className="flex flex-col gap-4 w-full px-2">
                {menuItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`p-3 rounded-xl flex justify-center items-center transition-all duration-200 ${
                                isActive 
                                ? 'bg-white text-[#F28322] shadow-md transform scale-105' 
                                : 'text-white hover:bg-white/20'
                            }`}
                            title={item.label}
                        >
                            <item.icon size={24} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}