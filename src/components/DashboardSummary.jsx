function DashboardSummary({ usersCount, tasksCount, completedTasksCount }) {
  const summaryItems = [
    {
      icon: 'bi-people',
      iconClassName: 'bg-primary-subtle text-primary-emphasis',
      value: usersCount,
      label: 'Usuarios registrados',
    },
    {
      icon: 'bi-list-task',
      iconClassName: 'bg-info-subtle text-info-emphasis',
      value: tasksCount,
      label: 'Tareas totales',
    },
    {
      icon: 'bi-check-circle',
      iconClassName: 'bg-success-subtle text-success-emphasis',
      value: completedTasksCount,
      label: 'Tareas completadas',
    },
  ]

  return (
    <section>
      <div className="row g-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="col-12 col-lg-4">
            <article className="card shadow-sm border-0 h-100 main-content-card summary-card-strong">
              <div className="card-body p-4">
                <p className="display-6 fw-bold mb-2 d-flex align-items-center gap-2">
                  <span className={`metric-icon ${item.iconClassName}`}>
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </span>
                  {item.value}
                </p>
                <p className="text-body-secondary mb-0">{item.label}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DashboardSummary
