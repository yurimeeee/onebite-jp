import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

type Mode = 'word' | 'blank' | 'listen' | 'swipe' | 'radio' | 'timeattack';
type Category = 'main' | 'sub';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category>('main');

  const selectMode = (mode: Mode) => {
    router.push(`/learn/level?mode=${mode}`);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text className="text-sm font-semibold text-text-secondary">오늘도 한 입</Text>
      <Text className="mt-1 text-3xl font-bold text-text-primary">무엇을 배워볼까요?</Text>

      {/* 카테고리 탭 */}
      <View className="flex-row gap-2 p-1 mt-6 rounded-pill" style={{ backgroundColor: colors.surface2 }}>
        <CategoryTab label="메인 학습" active={category === 'main'} onPress={() => setCategory('main')} />
        <CategoryTab label="서브 학습" active={category === 'sub'} onPress={() => setCategory('sub')} />
      </View>

      {category === 'main' ? (
        <View className="gap-4 mt-5">
          <ModeCard
            onPress={() => selectMode('word')}
            title="🥊 단어 정면승부"
            desc="4지선다로 빠르게 어휘 암기, 뇌 풀가동 모드"
            minutes={3}
            icon="albums"
            bg={colors.pastelCyanLight}
          />
          <ModeCard
            onPress={() => selectMode('blank')}
            title="🧩 문장 빈칸 채우기"
            desc="예문 속에서 자연스럽게 익히는 진짜 일본어"
            minutes={5}
            icon="create"
            bg={colors.pastelAmberLight}
          />
          <ModeCard onPress={() => selectMode('listen')} title="👂 리스닝 퀴즈" desc="발음 듣고 뜻 맞히기, 리스닝 감 잡기" minutes={4} icon="headset" bg={colors.pastelPinkLight} />
        </View>
      ) : (
        <View className="gap-4 mt-5">
          <ModeCard
            onPress={() => selectMode('swipe')}
            title="👀 뇌 빼고 단어 넘기기"
            desc="숏폼처럼 스와이프로 빠르게 훑어보기"
            minutes={2}
            icon="albums-outline"
            bg={colors.pastelLimeLight}
          />
          <ModeCard
            onPress={() => selectMode('radio')}
            title="🎧 출퇴근 라디오"
            desc="화면 없이 듣기만 해도 되는 오디오 학습"
            minutes={10}
            icon="radio-outline"
            bg={colors.pastelCyanLight}
          />
          <ModeCard
            onPress={() => selectMode('timeattack')}
            title="⏱️ 5초 타임어택"
            desc="제한시간 안에 스피드로 맞히기"
            minutes={2}
            icon="flash-outline"
            bg={colors.pastelAmberLight}
          />
        </View>
      )}
    </ScrollView>
  );
}

function CategoryTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center py-2.5 rounded-pill active:opacity-80" style={{ backgroundColor: active ? colors.surface : 'transparent' }}>
      <Text className="text-sm font-bold" style={{ color: active ? colors.textPrimary : colors.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ModeCard({
  onPress,
  title,
  desc,
  minutes,
  icon,
  bg,
}: {
  onPress: () => void;
  title: string;
  desc: string;
  minutes: number;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}) {
  return (
    <Pressable onPress={onPress} className="rounded-card p-5 active:scale-[0.98]" style={{ backgroundColor: bg, borderWidth: 2, borderColor: 'transparent' }}>
      <View className="flex-row items-center justify-between">
        <View className="items-center justify-center w-12 h-12 rounded-pill bg-surface">
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </View>
      <Text className="mt-4 text-xl font-bold text-text-primary">{title}</Text>
      <Text className="mt-1 text-text-secondary">{desc}</Text>
      <View className="flex-row items-center gap-1 mt-3">
        <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
        <Text className="text-sm text-text-secondary">약 {minutes}분</Text>
      </View>
    </Pressable>
  );
}
