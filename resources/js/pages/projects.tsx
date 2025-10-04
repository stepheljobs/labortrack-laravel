import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Users, Calendar, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

interface Project {
    id: number;
    name: string;
    description: string;
    location: string;
    status: string;
    start_date: string;
    end_date: string;
    labor_count: number;
    message_count: number;
}

interface ProjectsProps {
    projects: Project[];
}

export default function Projects({ projects = [] }: ProjectsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your construction projects and track labor progress.
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-center">
                                <h3 className="text-lg font-medium">No projects yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating your first project.
                                </p>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                    <CardDescription>{project.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {project.start_date} - {project.end_date}
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-2 h-4 w-4" />
                                            {project.labor_count} laborers
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            {project.message_count} messages
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                project.status === 'active' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            }`}>
                                                {project.status}
                                            </span>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
