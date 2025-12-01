import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    admins = [],
}: {
    mustVerifyEmail: boolean;
    status?: string;
    admins?: Array<{ id: number; name: string; email: string }>;
}) {
    const { auth } = usePage<SharedData>().props;
    const [isEditingAdmin, setIsEditingAdmin] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState(auth?.user?.admin_id?.toString() || '');

    const handleAdminChange = () => {
        router.patch(route('profile.update'), {
            admin_id: selectedAdminId || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingAdmin(false);
            },
        });
    };

    const showRequestSent = status === 'admin-request-sent';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <div className="p-4 mb-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                        <p className="font-bold">DEBUG INFO:</p>
                        <ul className="list-disc list-inside">
                            <li>Your Role: <strong>{auth?.user?.role}</strong></li>
                            <li>Is Admin?: <strong>{auth?.user?.role === 'admin' ? 'Yes' : 'No'}</strong></li>
                            <li>Should Show Section?: <strong>{auth?.user?.role !== 'admin' ? 'Yes' : 'No'}</strong></li>
                            <li>Available Admins: <strong>{admins?.length || 0}</strong></li>
                        </ul>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth?.user?.name || ''}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth?.user?.email || ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {auth?.user?.role !== 'admin' && (
                                    <>
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="admin_name">Admin Account</Label>
                                                {!isEditingAdmin && (
                                                    admins && Array.isArray(admins) && admins.length > 0 ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setIsEditingAdmin(true)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No admins available</span>
                                                    )
                                                )}
                                            </div>

                                            {!isEditingAdmin ? (
                                                <>
                                                    <Input
                                                        id="admin_name"
                                                        className="mt-1 block w-full bg-muted"
                                                        value={
                                                            admins && Array.isArray(admins)
                                                                ? (admins.find((a: any) => a.id === auth?.user?.admin_id)?.name || 'No admin assigned')
                                                                : 'No admin assigned'
                                                        }
                                                        disabled
                                                        readOnly
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        The administrator who manages your account.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                        value={selectedAdminId}
                                                        onChange={(e) => setSelectedAdminId(e.target.value)}
                                                    >
                                                        <option value="">No admin (Independent)</option>
                                                        {admins && Array.isArray(admins) && admins.map((admin: any) => (
                                                            <option key={admin.id} value={admin.id.toString()}>
                                                                {admin.name} ({admin.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={handleAdminChange}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setIsEditingAdmin(false);
                                                                setSelectedAdminId(auth?.user?.admin_id?.toString() || '');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Select the administrator who will manage your account.
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {showRequestSent && (
                                            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                                                <p className="text-sm text-green-800 dark:text-green-200">
                                                    Admin assignment request sent! The admin will be notified and can approve your request.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {mustVerifyEmail &&
                                    auth?.user?.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
