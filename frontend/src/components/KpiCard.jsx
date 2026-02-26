export default function KpiCard({ title, value, secondary, icon, color }) {
    return (
        <div
            className={`bg-panelBG border-l-4 ${color} border-y border-r border-panelBorder rounded-r-xl p-5 shadow-lg transition-transform hover:-translate-y-1 duration-300`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-accentText text-xs font-medium">{title}</p>
                    <h4 className="text-2xl font-bold mt-1 text-white">{value}</h4>
                </div>
                <div className="p-2 bg-darkBG rounded-lg">{icon}</div>
            </div>
            <p className="text-xs text-accentText mt-3">{secondary}</p>
        </div>
    );
}
