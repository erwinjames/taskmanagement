import AppLogoIcon from '@/components/app-logo-icon';
import { GalleryVerticalEnd } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
            {/* Left Side - Visual/Branding */}
            <div className="relative hidden flex-col justify-between bg-zinc-900 p-10 text-white lg:flex dark:border-r dark:border-zinc-800">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 h-8 w-8 text-white" />
                    TaskManager
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This task management system has completely transformed how our team operates. The clarity and focus it provides are unmatched.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-400">Sofia Davis, Product Manager</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center bg-black p-8 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 font-medium text-white"> {/* Added justify-center and text-white for styling */}
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            Task Management
                        </div>
                        <p className="text-sm text-zinc-400">
                            {description}
                        </p>
                    </div>
                    {children}
                    <p className="px-8 text-center text-sm text-zinc-400">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-white"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-white"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
