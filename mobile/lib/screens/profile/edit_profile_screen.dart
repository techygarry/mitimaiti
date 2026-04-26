import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/user_provider.dart';
import '../../theme.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _picker = ImagePicker();
  bool _uploading = false;

  Future<void> _pickAndUpload() async {
    if (_uploading) return;
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 80,
    );
    if (image == null) return;
    setState(() => _uploading = true);
    final ok = await ref.read(userProvider.notifier).uploadPhoto(image.path);
    if (!mounted) return;
    setState(() => _uploading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Photo uploaded' : 'Upload failed')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final photos = ref.watch(userProvider).user?.photos ?? const [];
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        title: const Text('Edit Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Photos section
          const Text('Photos', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 0.75),
            itemCount: 6,
            itemBuilder: (_, i) {
              final hasPhoto = i < photos.length;
              return GestureDetector(
                onTap: hasPhoto ? null : _pickAndUpload,
                child: Container(
                  decoration: BoxDecoration(
                    color: MitiMaitiTheme.background,
                    border: Border.all(color: MitiMaitiTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: hasPhoto
                      ? CachedNetworkImage(
                          imageUrl: photos[i].url,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Container(color: MitiMaitiTheme.border),
                        )
                      : Center(
                          child: _uploading && i == photos.length
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                              : Icon(Icons.add_photo_alternate_outlined, color: MitiMaitiTheme.textSecondary),
                        ),
                ),
              );
            },
          ),
          const SizedBox(height: 32),

          // My Basics
          _SectionHeader('My Basics', 8),
          _EditField('Height (cm)', 'Enter height'),
          _EditField('Education', 'Select education'),
          _EditField('Work', 'What do you do?'),
          _EditField('Drinking', 'Select'),
          _EditField('Smoking', 'Select'),
          _EditField('Kids', 'Select'),
          _EditField('Settling Plans', 'Select'),
          _EditField('Exercise', 'Select'),
          const SizedBox(height: 24),

          // My Sindhi Identity
          _SectionHeader('My Sindhi Identity', 5),
          _EditField('Sindhi Fluency', 'Native / Fluent / Basic / None'),
          _EditField('Religion', 'Select religion'),
          _EditField('Gotra', 'Search 200+ gotras'),
          _EditField('Generation', '1st / 2nd / 3rd / 4th+'),
          _EditField('Dietary', 'Veg / Non-veg / Vegan / Jain'),
          const SizedBox(height: 24),

          // My Chatti
          _SectionHeader('My Chatti', 7),
          _EditField('Chatti Name', 'Enter name'),
          _EditField('Date of Birth', 'Select date'),
          _EditField('Time of Birth', 'Select time'),
          _EditField('Place of Birth', 'Enter place'),
          _EditField('Nakshatra', 'Select from 27'),
          _EditField('Rashi', 'Select from 12'),
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: MitiMaitiTheme.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(children: [
              Icon(Icons.upload_file, color: MitiMaitiTheme.textSecondary),
              SizedBox(width: 12),
              Text('Upload Chatti Image', style: TextStyle(color: MitiMaitiTheme.textSecondary)),
            ]),
          ),
          const SizedBox(height: 24),

          // My Culture
          _SectionHeader('My Culture', 3),
          _EditField('Festivals Celebrated', 'Multi-select'),
          _EditField('Family Involvement', 'Very / Moderate / Independent'),
          _EditField('Favourite Dish', 'Enter dish'),
          const SizedBox(height: 24),

          // My Personality
          _SectionHeader('My Personality', 5),
          _EditField('About Me', 'Write a short bio...'),
          _EditField('Prompts', 'Pick 3 prompts'),
          _EditField('Interests', 'Select up to 8'),
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: MitiMaitiTheme.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(children: [
              Icon(Icons.mic, color: MitiMaitiTheme.rose),
              SizedBox(width: 12),
              Text('Record Voice Intro (30s)', style: TextStyle(color: MitiMaitiTheme.charcoal)),
            ]),
          ),
          _EditField('Languages', 'Select languages'),
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final int fieldCount;
  const _SectionHeader(this.title, this.fieldCount);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const Spacer(),
        Text('$fieldCount fields', style: const TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
      ]),
    );
  }
}

class _EditField extends StatelessWidget {
  final String label, hint;
  const _EditField(this.label, this.hint);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: const TextStyle(fontSize: 14, color: MitiMaitiTheme.textSecondary),
        ),
      ),
    );
  }
}
