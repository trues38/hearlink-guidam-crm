export default function Dashboard() {
  const stats = [
    { label: "오늘 방문", value: "12", icon: "👥" },
    { label: "미처리 문서", value: "5", icon: "📄" },
    { label: "이번 달 매출", value: "₩2,450,000", icon: "💰" },
    { label: "알림", value: "3", icon: "🔔" },
  ];

  const recentActivities = [
    { time: "10:30", action: "홍길동 고객 등록", type: "customer" },
    { time: "09:45", action: "장비 피팅 완료", type: "device" },
    { time: "09:20", action: "세금계산서 전송", type: "document" },
    { time: "08:30", action: "신규 결제 완료", type: "payment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h2>
        <ul className="space-y-3">
          {recentActivities.map((activity, index) => (
            <li
              key={index}
              className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0"
            >
              <span className="text-sm text-gray-400 w-12">{activity.time}</span>
              <span className="flex-1 text-gray-700">{activity.action}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  activity.type === "customer"
                    ? "bg-blue-100 text-blue-700"
                    : activity.type === "device"
                    ? "bg-green-100 text-green-700"
                    : activity.type === "document"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {activity.type}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
