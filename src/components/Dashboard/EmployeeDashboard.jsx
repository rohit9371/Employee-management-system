import React, { useContext, useMemo, useCallback } from 'react'
import Header from '../other/Header'
import TaskListNumbers from '../other/TaskListNumbers'
import TaskList from '../TaskList/TaskList'
import { AuthContext } from '../../context/AuthProvider'

const EmployeeDashboard = (props) => {

  const [userData, setUserData] = useContext(AuthContext)

  const employee = useMemo(() => {
    if (!userData) return props.data
    const found = userData.find((e) => e.id === props.data?.id)
    return found || props.data
  }, [userData, props.data])

  const updateEmployeeTasks = useCallback((updater) => {
    setUserData((prev) => {
      if (!prev) return prev
      const next = prev.map((emp) => {
        if (emp.id !== employee.id) return emp
        const updatedEmp = updater(emp)
        return { ...updatedEmp }
      })
      // persist
      localStorage.setItem('employees', JSON.stringify(next))
      // also keep loggedInUser data fresh
      const logged = localStorage.getItem('loggedInUser')
      if (logged) {
        try {
          const parsed = JSON.parse(logged)
          if (parsed.role === 'employee') {
            const fresh = next.find((e) => e.id === employee.id)
            localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: fresh }))
          }
        } catch {}
      }
      return next
    })
  }, [employee, setUserData])

  const handleAccept = useCallback((taskIndex) => {
    updateEmployeeTasks((emp) => {
      const tasks = emp.tasks.map((t, idx) => {
        if (idx !== taskIndex) return t
        return { ...t, newTask: false, active: true }
      })
      const taskCounts = {
        ...emp.taskCounts,
        newTask: Math.max(0, emp.taskCounts.newTask - 1),
        active: emp.taskCounts.active + 1
      }
      return { ...emp, tasks, taskCounts }
    })
  }, [updateEmployeeTasks])

  const handleComplete = useCallback((taskIndex) => {
    updateEmployeeTasks((emp) => {
      const tasks = emp.tasks.map((t, idx) => {
        if (idx !== taskIndex) return t
        return { ...t, active: false, completed: true, failed: false }
      })
      const taskCounts = {
        ...emp.taskCounts,
        active: Math.max(0, emp.taskCounts.active - 1),
        completed: emp.taskCounts.completed + 1
      }
      return { ...emp, tasks, taskCounts }
    })
  }, [updateEmployeeTasks])

  const handleFailed = useCallback((taskIndex) => {
    updateEmployeeTasks((emp) => {
      const tasks = emp.tasks.map((t, idx) => {
        if (idx !== taskIndex) return t
        return { ...t, active: false, completed: false, failed: true }
      })
      const taskCounts = {
        ...emp.taskCounts,
        active: Math.max(0, emp.taskCounts.active - 1),
        failed: emp.taskCounts.failed + 1
      }
      return { ...emp, tasks, taskCounts }
    })
  }, [updateEmployeeTasks])

  return (
    <div className='p-10 bg-[#1C1C1C] h-screen'>
        <Header changeUser={props.changeUser} data={employee}/>
        <TaskListNumbers data={employee} />
        <TaskList data={employee} onAccept={handleAccept} onComplete={handleComplete} onFailed={handleFailed} />
    </div>
  )
}

export default EmployeeDashboard