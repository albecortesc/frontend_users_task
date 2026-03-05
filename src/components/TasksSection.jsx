function TasksSection({ tasks, isLoadingTasks, tasksError }) {
  let content = null

  if (isLoadingTasks) {
    content = <p className="text-body-secondary mb-0">Cargando tareas...</p>
  } else if (tasksError) {
    content = <p className="text-danger mb-0">{tasksError}</p>
  } else if (tasks.length === 0) {
    content = <p className="text-body-secondary mb-0">No hay tareas para mostrar.</p>
  } else {
    content = (
      <div className="list-group list-group-flush border rounded-3 overflow-hidden">
        {tasks.map((task) => (
          <article key={task.id ?? task.taskId ?? task.title} className="list-group-item py-3 px-3">
            <p className="fw-semibold mb-1 d-flex align-items-center list-title-strong">
              <i className="bi bi-check2-square me-2 list-icon" aria-hidden="true" />
              {task.title ?? 'Sin título'}
            </p>
            <p className="text-body-secondary mb-0">
              Estado: {task.completed ? 'Completada' : 'Pendiente'}
            </p>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className="card shadow-sm border-0 main-content-card">
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Tareas</h2>
        {content}
      </div>
    </section>
  )
}

export default TasksSection
