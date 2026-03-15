import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:image_picker/image_picker.dart';
import '../../widgets/onboarding_shell.dart';
import '../../theme.dart';

class PhotosScreen extends StatefulWidget {
  const PhotosScreen({super.key});
  @override
  State<PhotosScreen> createState() => _PhotosScreenState();
}

class _PhotosScreenState extends State<PhotosScreen> {
  final List<XFile?> _photos = List.filled(6, null);
  final _picker = ImagePicker();

  int get _photoCount => _photos.where((p) => p != null).length;

  Future<void> _pickPhoto(int index) async {
    final image = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 1200, imageQuality: 80);
    if (image != null) setState(() => _photos[index] = image);
  }

  void _next() {
    if (_photoCount < 1) return;
    // Save photo paths for later upload
    final paths = _photos.where((p) => p != null).map((p) => p!.path).toList();
    Hive.box('onboarding').put('photoPaths', paths);
    Hive.box('settings').put('onboardingStep', 4);
    context.go('/onboarding/intent');
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingShell(
      title: 'Add your\nbest photos',
      subtitle: 'At least 1 photo required. Up to 6.',
      step: 4,
      onBack: () => context.go('/onboarding/gender'),
      child: Column(
        children: [
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 0.75,
              ),
              itemCount: 6,
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => _pickPhoto(i),
                child: Semantics(
                  label: _photos[i] != null ? 'Photo ${i + 1} added. Tap to change' : 'Add photo ${i + 1}',
                  child: Container(
                    decoration: BoxDecoration(
                      color: MitiMaitiTheme.background,
                      border: Border.all(
                        color: i == 0 && _photos[0] == null ? MitiMaitiTheme.rose : MitiMaitiTheme.border,
                        width: i == 0 && _photos[0] == null ? 2 : 1,
                        style: _photos[i] == null ? BorderStyle.solid : BorderStyle.solid,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: _photos[i] != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(11),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset('assets/placeholder.png', fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(color: MitiMaitiTheme.border)),
                              Positioned(
                                top: 4, right: 4,
                                child: GestureDetector(
                                  onTap: () => setState(() => _photos[i] = null),
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54, shape: BoxShape.circle),
                                    child: const Icon(Icons.close, size: 16, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_photo_alternate_outlined,
                              size: 32, color: i == 0 ? MitiMaitiTheme.rose : MitiMaitiTheme.textSecondary),
                            const SizedBox(height: 4),
                            if (i == 0) Text('Required',
                              style: TextStyle(fontSize: 11, color: MitiMaitiTheme.rose)),
                          ],
                        ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity, height: 56,
            child: ElevatedButton(
              onPressed: _photoCount >= 1 ? _next : null,
              child: const Text('Continue'),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
