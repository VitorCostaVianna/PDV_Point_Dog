import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Users, Dog } from 'lucide-react';

export function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: ShoppingCart, label: 'PDV / Vendas' },
        { path: '/clientes', icon: Users, label: 'Clientes & Histórico' },
    ];

    return (
        <div className="w-20 bg-blue-900 h-screen flex flex-col items-center py-6 shadow-xl z-50">
            <div className="mb-8 text-white">
                <Dog size={32} />
            </div>
            
            <nav className="flex flex-col gap-4 w-full">
                {menuItems.map(item => (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`p-3 flex justify-center items-center transition-all ${
                            location.pathname === item.path 
                            ? 'bg-blue-700 text-white border-r-4 border-yellow-400' 
                            : 'text-blue-300 hover:text-white hover:bg-blue-800'
                        }`}
                        title={item.label}
                    >
                        <item.icon size={24} />
                    </Link>
                ))}
            </nav>
        </div>
    );
}