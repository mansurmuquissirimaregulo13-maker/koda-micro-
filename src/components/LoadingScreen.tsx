export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#F7F7F2] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#1B3A2D]/10 border-t-[#1B3A2D] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#1B3A2D] rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-widest animate-pulse">
                Carregando...
            </p>
        </div>
    );
}
