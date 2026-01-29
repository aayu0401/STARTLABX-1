import 'package:flutter/material.dart';
import 'splash/splash_screen.dart';
import 'onboarding/onboarding_screen.dart';
import 'chat/chat_screen.dart';
import 'kanban/kanban_board.dart';
import 'ai/copilot_screen.dart';
import 'reviews/review_screen.dart';

void main()=>runApp(const App());
class App extends StatelessWidget{
  const App({super.key});
  @override Widget build(BuildContext context)=>MaterialApp(
    debugShowCheckedModeBanner:false,
    routes:{
      '/onboarding':(_)=>const OnboardingScreen(),
      '/auth':(_)=>const ChatScreen(),
      '/chat':(_)=>const ChatScreen(),
      '/kanban':(_)=>const KanbanBoard(),
      '/ai':(_)=>const CopilotScreen(),
      '/reviews':(_)=>const ReviewScreen(),
    },
    home: const SplashScreen(),
  );
}
