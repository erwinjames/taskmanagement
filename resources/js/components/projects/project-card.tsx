import { Project } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, MoreVertical, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const completedPercentage = project.tasks_count > 0
        ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
        : 0;

    return (
        <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex flex-col gap-1">
                    <Link href={route('projects.show', project.id)} className="font-semibold hover:underline">
                        {project.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                        </Badge>
                        <Badge variant="outline">{project.priority}</Badge>
                    </div>
                </div>
                {/* DropdownMenu removed to prevent crash */}
                {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button> */}
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{completedPercentage}%</span>
                    </div>
                    <Progress value={completedPercentage} className="h-2" />
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                    {project.members && project.members.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                            +{project.members.length - 3}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                        {project.deadline && !isNaN(new Date(project.deadline).getTime())
                            ? new Date(project.deadline).toLocaleDateString()
                            : 'No deadline'}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
