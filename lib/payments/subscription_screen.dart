import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import 'package:url_launcher/url_launcher.dart';
import '../ui/widgets/app_card.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});
  @override ConsumerState<SubscriptionScreen> createState()=>_SubscriptionScreenState();
}
class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen>{
  bool loading=true; Map? sub;
  @override void initState(){super.initState();load();}
  Future<void> load() async{
    final dio=ref.read(authProvider.notifier).authed();
    final res=await dio.get('/payments/me');
    setState((){sub=res.data;loading=false;});
  }
  Future<void> upgrade() async{
    final dio=ref.read(authProvider.notifier).authed();
    final res=await dio.post('/payments/checkout', data:{'priceId':'price_PRO'});
    await launchUrl(Uri.parse(res.data['checkoutUrl']), mode: LaunchMode.externalApplication);
  }
  @override Widget build(BuildContext context)=>loading?const Center(child:CircularProgressIndicator()):ListView(children:[
    AppCard(child: ListTile(title: Text('Current Plan: ${sub?['plan'] ?? 'FREE'}'))),
    const SizedBox(height:8),
    Padding(padding: const EdgeInsets.all(8), child: FilledButton(onPressed: upgrade, child: const Text('Upgrade to Pro')))
  ]);
}
