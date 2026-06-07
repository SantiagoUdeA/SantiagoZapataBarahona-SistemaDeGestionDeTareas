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
  getProgressOverTime,
  createTask,
  updateTask,
  updateTaskStatus,
  getAssignableProfiles,
} from './tasks'

import { listUsers, listAssignableUsers, createUser, updateUserRole, toggleUserEnabled, deleteUser, assignUserToProject, removeUserFromProject } from './users'
import { listProjects, listSelectableProjects, createProject, updateProject, deleteProject, getProjectMembers } from './projects'
import { listTasks, getProgressOverTime, createTask, updateTask, updateTaskStatus, getAssignableProfiles } from './tasks'
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
  getProgressOverTime,
  createTask,
  updateTask,
  updateTaskStatus,
  getAssignableProfiles,
} satisfies ToolSet
