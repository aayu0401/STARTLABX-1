import 'package:local_auth/local_auth.dart';

class BiometricsAuth{
  final auth=LocalAuthentication();
  Future<bool> check() async{
    return await auth.authenticate(localizedReason: 'Authenticate to continue');
  }
}
