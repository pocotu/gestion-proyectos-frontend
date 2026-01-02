import { useState } from 'react';
import ProjectTasksCard from './ProjectTasksCard';
import ProjectFilesCard from './ProjectFilesCard';
import ProjectActivityCard from './ProjectActivityCard';
import '../../styles/projectDetailTabs.css';

/**
 * ProjectDetailTabs - Modern tab interface for project details
 * Displays Tasks (Kanban), Files, and Activity in separate tabs
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of project tasks
 * @param {Array} props.files - Array of project files
 * @param {Array} props.activityLogs - Array of activity logs
 * @param {number} props.projectId - Project ID
 * @param {boolean} props.canManage - Whether user can manage files
 * @param {Function} props.onFileUpload - Callback for file upload
 * @param {Function} props.onFileDownload - Callback for file download
 * @param {Function} props.onFileDelete - Callback for file delete
 * @param {Function} props.onCreateTask - Callback for creating task
 * @param {Function} props.onEditTask - Callback for editing task
 * @returns {JSX.Element}
 */
const ProjectDetailTabs = ({ 
  tasks = [], 
  files = [], 
  activityLogs = [], 
  projectId,
  canManage = false,
  onFileUpload,
  onFileDownload,
  onFileDelete,
  onCreateTask,
  onEditTask
}) => {
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    {
      id: 'tasks',
      label: 'Tareas',
      icon: (
        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      count: tasks.length
    },
    {
      id: 'files',
      label: 'Archivos',
      icon: (
        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      count: files.length
    },
    {
      id: 'activity',
      label: 'Actividad',
      icon: (
        <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: activityLogs.length
    }
  ];

  return (
    <div className="project-detail-tabs">
      {/* Tab Navigation */}
      <div className="project-tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`project-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="project-tab-icon">{tab.icon}</span>
            <span className="project-tab-label">{tab.label}</span>
            {tab.count > 0 && (
              <span className="project-tab-badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="project-tabs-content">
        {activeTab === 'tasks' && (
          <div className="project-tab-panel">
            <ProjectTasksCard 
              tasks={tasks}
              projectId={projectId}
              canManage={canManage}
              onCreate={onCreateTask}
              onEdit={onEditTask}
              hideHeader={true}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="project-tab-panel">
            <ProjectFilesCard 
              files={files}
              projectId={projectId}
              canManage={canManage}
              onUpload={onFileUpload}
              onDownload={onFileDownload}
              onDelete={onFileDelete}
              hideHeader={true}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="project-tab-panel">
            <ProjectActivityCard 
              activityLogs={activityLogs}
              hideHeader={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailTabs;
