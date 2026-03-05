import { useEffect, useMemo, useState } from 'react'
import { getTasks, getUsers } from '../api/client'

export const useDashboardData = () => {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])

  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  const [usersError, setUsersError] = useState('')
  const [tasksError, setTasksError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      setUsersError('')

      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error) {
        setUsersError(error.message)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    const loadTasks = async () => {
      setIsLoadingTasks(true)
      setTasksError('')

      try {
        const data = await getTasks()
        setTasks(data)
      } catch (error) {
        setTasksError(error.message)
      } finally {
        setIsLoadingTasks(false)
      }
    }

    loadUsers()
    loadTasks()
  }, [])

  const completedTasksCount = useMemo(() => {
    return tasks.filter((task) => task.completed === true).length
  }, [tasks])

  return {
    users,
    tasks,
    isLoadingUsers,
    isLoadingTasks,
    usersError,
    tasksError,
    completedTasksCount,
  }
}
