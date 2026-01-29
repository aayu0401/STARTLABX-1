import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'services/auth_service.dart';
import 'auth/login_screen.dart';
import 'dashboard/founder_dashboard.dart';
import 'dashboard/professional_dashboard.dart';
import 'notifications/notifications_screen.dart';
import 'profile/profile_screen.dart';
import 'payments/subscription_screen.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});
  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) return const LoginScreen();

    final pages = [
      auth.role == 'FOUNDER' ? const FounderDashboard() : const ProfessionalDashboard(),
      const NotificationsScreen(),
      const ProfileScreen(),
      const SubscriptionScreen(),
    ];

    return Scaffold(
      body: SafeArea(child: pages[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => setState(() => index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), label: 'Alerts'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          NavigationDestination(icon: Icon(Icons.workspace_premium_outlined), label: 'Plan'),
        ],
      ),
    );
  }
}
