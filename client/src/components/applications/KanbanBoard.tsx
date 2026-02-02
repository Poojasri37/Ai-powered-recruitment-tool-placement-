import React from 'react';
import { useDroppable, useDraggable, DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanBoardProps {
    applications: any[];
    onStatusChange: (id: string, newStatus: string) => void;
}

const DroppableColumn = ({ id, title, count, children }: any) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-xl min-w-[280px] w-full flex flex-col h-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">{title}</h3>
                <span className="bg-white text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{count}</span>
            </div>
            <div className="flex-1 space-y-3 min-h-[100px]">
                {children}
            </div>
        </div>
    );
};

const DraggableCard = ({ app }: any) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: app._id,
        data: { app }, // Pass app data for overlay
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-grab active:cursor-grabbing border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-800 text-sm">{app.candidate.name}</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${app.matchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {app.matchScore}%
                </span>
            </div>
            <p className="text-xs text-gray-500 truncate mb-2">{app.candidate.email}</p>
            <div className="flex gap-1 flex-wrap">
                {app.resume?.skills?.slice(0, 2).map((skill: string) => (
                    <span key={skill} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100">{skill}</span>
                ))}
            </div>
        </div>
    );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications, onStatusChange }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeId, setActiveId] = React.useState<string | null>(null);

    const columns = [
        { id: 'applied', title: 'Applied' },
        { id: 'reviewing', title: 'Reviewing' },
        { id: 'interview_scheduled', title: 'Interview' },
        { id: 'accepted', title: 'Offer / Hired' },
        { id: 'rejected', title: 'Rejected' }
    ];

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Check if dropped on a column
            const columnId = columns.find(col => col.id === over.id)?.id;
            if (columnId) {
                onStatusChange(active.id, columnId);
            } else {
                // Check if dropped on another card? For now just handle column drops
                // We can't strictly assume over.id is a column if using Sortable, but with simplified Droppable columns it works.
            }
        }
        setActiveId(null);
    };

    return (
        <div className="flex overflow-x-auto gap-4 pb-4 h-[calc(100vh-250px)]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {columns.map(col => (
                    <DroppableColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        count={applications.filter(app => app.status === col.id).length}
                    >
                        {applications
                            .filter(app => app.status === col.id)
                            .map(app => <DraggableCard key={app._id} app={app} />)
                        }
                    </DroppableColumn>
                ))}
                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-blue-500 opacity-90 rotate-3 cursor-grabbing w-[250px]">
                            <span className="font-bold text-gray-800">Moving Candidate...</span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
