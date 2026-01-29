import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget{
  const OnboardingScreen({super.key});
  @override State<OnboardingScreen> createState()=>_State();
}

class _State extends State<OnboardingScreen>{
  final controller=PageController();
  int page=0;
  final titles=['Build Startups Together','Match. Collaborate. Grow.','Launch Faster'];
  @override
  Widget build(BuildContext context)=>Scaffold(
    body: PageView.builder(
      controller: controller,
      onPageChanged:(i)=>setState(()=>page=i),
      itemCount:3,
      itemBuilder:(_,i)=>Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center,children:[
          Icon(Icons.auto_awesome,size:140,color: Theme.of(context).colorScheme.primary),
          const SizedBox(height:24),
          Text(titles[i],textAlign: TextAlign.center,style: const TextStyle(fontSize:24,fontWeight: FontWeight.bold)),
        ]),
      ),
    ),
    bottomNavigationBar: Padding(
      padding: const EdgeInsets.all(16),
      child: FilledButton(
        onPressed:(){
          if(page==2){
            Navigator.pushReplacementNamed(context,'/auth');
          }else{
            controller.nextPage(duration: const Duration(milliseconds:400),curve:Curves.easeOut);
          }
        },
        child: Text(page==2?'Get Started':'Next'),
      ),
    ),
  );
}
