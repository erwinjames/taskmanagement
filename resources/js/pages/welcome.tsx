import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }: { auth: any }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center selection:bg-red-500 selection:text-white">
                <div className="w-full max-w-2xl px-6 lg:max-w-7xl">
                    <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                        <div className="flex lg:justify-center lg:col-start-2">
                            <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                Task Management
                            </h1>
                        </div>
                        <nav className="-mx-3 flex flex-1 justify-end">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md px-3 py-2 text-white ring-1 ring-transparent transition hover:text-white/70 focus:outline-none focus-visible:ring-[#FF2D20]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-md px-3 py-2 text-white ring-1 ring-transparent transition hover:text-white/70 focus:outline-none focus-visible:ring-[#FF2D20]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md px-3 py-2 text-white ring-1 ring-transparent transition hover:text-white/70 focus:outline-none focus-visible:ring-[#FF2D20]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-16 flex flex-col items-center justify-center text-center">
                        <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
                            Manage your tasks <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                                with elegance.
                            </span>
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl">
                            A premium task management experience designed for productivity and focus.
                            Organize your life with our intuitive and beautiful interface.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300"
                            >
                                Get Started
                            </Link>
                            <Link href={route('login')} className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors">
                                Log in <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </main>

                    <footer className="py-16 text-center text-sm text-gray-500">
                        Task Management System v1.0
                    </footer>
                </div>
            </div>
        </>
    );
}
