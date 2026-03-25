import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTasks, getUsers } from '../api/client'

export const useDashboardData = ({ enabled = true } = {}) => {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])

  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  const [usersError, setUsersError] = useState('')
  const [tasksError, setTasksError] = useState('')

  const loadUsers = useCallback(async () => {
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
  }, [])

  const loadTasks = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!enabled) {
      setUsers([])
      setTasks([])
      setUsersError('')
      setTasksError('')
      setIsLoadingUsers(false)
      setIsLoadingTasks(false)
      return
    }

    loadUsers()
    loadTasks()
  }, [enabled, loadTasks, loadUsers])

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
    reloadUsers: loadUsers,
  }
}
