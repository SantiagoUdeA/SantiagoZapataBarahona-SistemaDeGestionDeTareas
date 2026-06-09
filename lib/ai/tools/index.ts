export {
  listUsers,
  listAssignableUsers,
  createUser,
  updateUserRole,
  toggleUserEnabled,
  deleteUser,
  assignUserToProject,
  removeUserFromProject,
} from './users'

export {
  listProjects,
  listSelectableProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
} from './projects'

export {
  listTasks,
  listColumns,
  getProgressOverTime,
  createTask,
  updateTask,
  moveTaskToColumn,
  getAssignableProfiles,
} from './tasks'

export {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumn,
  setColumnDone,
  reorderTask,
} from './columns'

export {
  listMovements,
  listMovementProjects,
} from './movements'

import { listUsers, listAssignableUsers, createUser, updateUserRole, toggleUserEnabled, deleteUser, assignUserToProject, removeUserFromProject } from './users'
import { listProjects, listSelectableProjects, createProject, updateProject, deleteProject, getProjectMembers } from './projects'
import { listTasks, listColumns, getProgressOverTime, createTask, updateTask, moveTaskToColumn, getAssignableProfiles } from './tasks'
import { createColumn, renameColumn, deleteColumn, reorderColumn, setColumnDone, reorderTask } from './columns'
import { listMovements, listMovementProjects } from './movements'
import type { ToolSet } from 'ai'

export const toolset = {
  listUsers,
  listAssignableUsers,
  createUser,
  updateUserRole,
  toggleUserEnabled,
  deleteUser,
  assignUserToProject,
  removeUserFromProject,
  listProjects,
  listSelectableProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  listTasks,
  listColumns,
  getProgressOverTime,
  createTask,
  updateTask,
  moveTaskToColumn,
  getAssignableProfiles,
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumn,
  setColumnDone,
  reorderTask,
  listMovements,
  listMovementProjects,
} satisfies ToolSet
