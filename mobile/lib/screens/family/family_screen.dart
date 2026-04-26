import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../providers/user_provider.dart';
import '../../theme.dart';
import '../../widgets/empty_state.dart';

class FamilyScreen extends ConsumerStatefulWidget {
  const FamilyScreen({super.key});
  @override
  ConsumerState<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends ConsumerState<FamilyScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<_MockMember> _members = [];
  final List<_MockSuggestion> _suggestions = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  void _showJoinDialog() {
    final codeCtrl = TextEditingController();
    String role = 'parent';
    bool joining = false;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: const Text('Join a Family'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Enter the invite code', style: TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: codeCtrl,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(hintText: 'MM-XXXXXX', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              const Text('Your role', style: TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
              const SizedBox(height: 4),
              Wrap(spacing: 6, children: [
                for (final r in ['parent', 'sibling', 'friend'])
                  ChoiceChip(label: Text(r[0].toUpperCase() + r.substring(1)), selected: role == r, onSelected: (_) => setState(() => role = r)),
              ]),
            ],
          ),
          actions: [
            TextButton(onPressed: joining ? null : () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: codeCtrl.text.isEmpty || joining ? null : () async {
                setState(() => joining = true);
                final ok = await ref.read(userProvider.notifier).joinFamily(codeCtrl.text, role);
                if (!ctx.mounted) return;
                Navigator.pop(ctx);
                final messenger = ScaffoldMessenger.maybeOf(ctx);
                messenger?.showSnackBar(
                  SnackBar(content: Text(ok ? 'Joined family' : 'Invalid or expired code')),
                );
              },
              child: Text(joining ? 'Joining...' : 'Join'),
            ),
          ],
        ),
      ),
    );
  }

  void _generateInvite() {
    // TODO: POST /v1/family/invite
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Invite Family'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Share this code with your family member:'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: MitiMaitiTheme.rose.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text('MM-X7K2', style: TextStyle(
                fontSize: 24, fontWeight: FontWeight.w700, color: MitiMaitiTheme.rose, letterSpacing: 4)),
            ),
            const SizedBox(height: 8),
            const Text('Code expires in 48 hours', style: TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          ElevatedButton(
            onPressed: () {
              Share.share('Join my MitiMaiti family! Use code: MM-X7K2');
              Navigator.pop(context);
            },
            child: const Text('Share'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Family Mode'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: MitiMaitiTheme.rose,
          unselectedLabelColor: MitiMaitiTheme.textSecondary,
          indicatorColor: MitiMaitiTheme.rose,
          tabs: const [Tab(text: 'Members'), Tab(text: 'Suggestions'), Tab(text: 'Invite')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Members tab
          _members.isEmpty
            ? EmptyState(
                icon: Icons.family_restroom,
                title: 'No family members yet',
                message: 'Invite up to 3 family members to help you find matches.',
                actionLabel: 'Invite Family',
                onAction: _generateInvite,
              )
            : ListView.builder(
                itemCount: _members.length,
                itemBuilder: (_, i) => _MemberCard(member: _members[i]),
              ),
          // Suggestions tab
          _suggestions.isEmpty
            ? const EmptyState(
                icon: Icons.lightbulb_outline,
                title: 'No suggestions yet',
                message: 'Your family hasn\'t suggested anyone yet.',
              )
            : ListView.builder(
                itemCount: _suggestions.length,
                itemBuilder: (_, i) => _SuggestionCard(suggestion: _suggestions[i]),
              ),
          // Invite tab
          _InviteTab(onGenerate: _generateInvite, onJoin: _showJoinDialog, memberCount: _members.length),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

class _MockMember {
  final String id, name, role;
  final Map<String, bool> permissions;
  const _MockMember({required this.id, required this.name, required this.role, required this.permissions});
}

class _MockSuggestion {
  final String id, suggestedName, suggestedCity, suggestedByName;
  final String? note;
  const _MockSuggestion({required this.id, required this.suggestedName, required this.suggestedCity, required this.suggestedByName, required this.note});
}

class _MemberCard extends StatelessWidget {
  final _MockMember member;
  const _MemberCard({required this.member});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(backgroundColor: MitiMaitiTheme.rose.withValues(alpha: 0.1),
                  child: const Icon(Icons.person, color: MitiMaitiTheme.rose)),
                const SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(member.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  Text(member.role, style: const TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
                ]),
                const Spacer(),
                TextButton(onPressed: () {}, style: TextButton.styleFrom(foregroundColor: MitiMaitiTheme.error),
                  child: const Text('Revoke')),
              ],
            ),
            const Divider(height: 24),
            const Text('Permissions', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            ...['Photos', 'Bio', 'Education', 'Chatti', 'Kundli', 'Prompts', 'Voice', 'Cultural Badges'].map((p) =>
              SwitchListTile(
                title: Text(p, style: const TextStyle(fontSize: 14)),
                value: true,
                onChanged: (_) {},
                dense: true,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SuggestionCard extends StatelessWidget {
  final _MockSuggestion suggestion;
  const _SuggestionCard({required this.suggestion});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Suggested by ${suggestion.suggestedByName}',
              style: const TextStyle(fontSize: 13, color: MitiMaitiTheme.textSecondary)),
            const SizedBox(height: 8),
            Text('${suggestion.suggestedName}, ${suggestion.suggestedCity}',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
            if (suggestion.note != null) ...[
              const SizedBox(height: 4),
              Text('"${suggestion.note}"', style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic)),
            ],
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: OutlinedButton(onPressed: () {}, child: const Text('Pass'))),
              const SizedBox(width: 8),
              Expanded(child: OutlinedButton(onPressed: () {}, child: const Text('Save'))),
              const SizedBox(width: 8),
              Expanded(child: ElevatedButton(onPressed: () {}, child: const Text('Like'))),
            ]),
          ],
        ),
      ),
    );
  }
}

class _InviteTab extends StatelessWidget {
  final VoidCallback onGenerate;
  final VoidCallback onJoin;
  final int memberCount;
  const _InviteTab({required this.onGenerate, required this.onJoin, required this.memberCount});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.family_restroom, size: 48, color: MitiMaitiTheme.rose),
          const SizedBox(height: 16),
          Text('Family Mode', style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 8),
          const Text('Invite up to 3 family members to browse profiles and suggest matches for you.',
            style: TextStyle(fontSize: 15, color: MitiMaitiTheme.textSecondary, height: 1.5)),
          const SizedBox(height: 24),
          _InfoRow(Icons.visibility_off, 'Family can never see your chats, matches, or swipes'),
          _InfoRow(Icons.tune, 'You control what they can see with 8 permission toggles'),
          _InfoRow(Icons.thumb_up_alt_outlined, 'Your decisions are never revealed to family'),
          const SizedBox(height: 32),
          Text('$memberCount / 3 members', style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity, height: 56,
            child: ElevatedButton(
              onPressed: memberCount < 3 ? onGenerate : null,
              child: const Text('Generate Invite Code'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity, height: 56,
            child: OutlinedButton.icon(
              onPressed: onJoin,
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Have a code? Join a family'),
            ),
          ),
          const SizedBox(height: 16),
          if (memberCount > 0)
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(foregroundColor: MitiMaitiTheme.error),
                child: const Text('Revoke All Family Access'),
              ),
            ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: MitiMaitiTheme.rose, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14, height: 1.4))),
        ],
      ),
    );
  }
}
