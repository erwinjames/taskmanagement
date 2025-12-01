import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { BreadcrumbItem, User } from '@/types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, CheckCircle2, Clock, AlertCircle, Mail, Calendar, Activity, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Team', href: '/team' },
];

interface TeamMember extends User {
    task_statistics: {
        total: number;
        completed: number;
        in_progress: number;
        pending: number;
    };
    project_count: number;
    skills?: string[];
}

interface Props {
    members: TeamMember[];
    departments: string[];
    roles: string[];
    statistics: {
        total_members: number;
        active_members: number;
        total_tasks: number;
        completed_tasks: number;
    };
    filters: {
        search?: string;
        role?: string;
        department?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
    };
    auth: { user: User };
}

export default function TeamIndex({ members, departments, roles, statistics, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        name: '',
        create_user: false,
    });

    const isAdmin = auth.user.role === 'admin';

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('team.invite'), {
            onSuccess: () => {
                reset();
                setIsInviteOpen(false);
            },
        });
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle filter changes
    useEffect(() => {
        const params: any = {};

        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedRole !== 'all') params.role = selectedRole;
        if (selectedDepartment !== 'all') params.department = selectedDepartment;
        if (selectedStatus !== 'all') params.status = selectedStatus;

        router.get(route('team.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['members', 'statistics'],
        });
    }, [debouncedSearch, selectedRole, selectedDepartment, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            case 'offline':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'member':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getWorkloadPercentage = (stats: TeamMember['task_statistics']) => {
        if (stats.total === 0) return 0;
        return Math.round(((stats.in_progress + stats.pending) / stats.total) * 100);
    };

    const getWorkloadColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-red-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
                        <p className="text-muted-foreground">Manage your team members and view their performance.</p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsInviteOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{statistics.total_members}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{statistics.active_members}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{statistics.total_tasks}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{statistics.completed_tasks}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-md">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="away">Away</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Team Members Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                        <div key={member.id} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                            {getInitials(member.name)}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{member.name}</h3>
                                        <p className="text-sm text-muted-foreground">{member.department || 'No Department'}</p>
                                    </div>
                                </div>
                                <Badge className={getRoleColor(member.role)}>
                                    {member.role}
                                </Badge>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                                {member.last_active_at && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span>Last active {formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Joined {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>

                            {/* Skills */}
                            {member.skills && member.skills.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {member.skills.slice(0, 3).map((skill: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {member.skills.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{member.skills.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Task Statistics */}
                            <div className="mt-4 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Tasks</span>
                                        <span className="font-medium">{member.task_statistics.total}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            <span>{member.task_statistics.completed}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-blue-600" />
                                            <span>{member.task_statistics.in_progress}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3 text-gray-600" />
                                            <span>{member.task_statistics.pending}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Workload Indicator */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Workload</span>
                                        <span className="text-xs">{getWorkloadPercentage(member.task_statistics)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getWorkloadColor(getWorkloadPercentage(member.task_statistics))}`}
                                            style={{ width: `${getWorkloadPercentage(member.task_statistics)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Projects */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Projects</span>
                                    <span className="font-medium">{member.project_count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {members.length === 0 && (
                    <div className="rounded-xl border bg-card p-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Invite Member Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Invite a user to join your team or create a new user account.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="user@example.com"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="name">Name (Optional)</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John Doe"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="create_user"
                                checked={data.create_user}
                                onChange={(e) => setData('create_user', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="create_user" className="cursor-pointer">
                                Create user immediately (instead of sending invitation)
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {data.create_user ? 'Create User' : 'Send Invitation'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
