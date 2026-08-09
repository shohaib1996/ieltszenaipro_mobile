import { Image, Pressable, Text, View } from 'react-native';
import { CircleCheckBig } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { TestQuestion } from '@/types/test';

function SelectableOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mb-2 flex-row items-center rounded-card border px-4 py-3',
        selected ? 'border-teal bg-teal/10' : 'border-black/10 dark:border-white/10',
      )}
    >
      <View
        className={cn(
          'mr-3 h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-teal' : 'border-black/30 dark:border-white/30',
        )}
      >
        {selected ? <CircleCheckBig size={16} color="#06D6A0" /> : null}
      </View>
      <Text className="flex-1 text-base text-black dark:text-white">{label}</Text>
    </Pressable>
  );
}

const TRUE_FALSE_CHOICES = ['True', 'False', 'Not Given'];
const YES_NO_CHOICES = ['Yes', 'No', 'Not Given'];

export function QuestionAnswerInput({
  question,
  index,
  value,
  onChange,
}: {
  question: TestQuestion;
  index: number;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-black dark:text-white">
        {index}. {question.text}
      </Text>

      {question.type === 'MCQ' || question.type === 'MATCHING' ? (
        question.options.map((option) => (
          <SelectableOption
            key={option}
            label={option}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))
      ) : question.type === 'TRUE_FALSE_NOT_GIVEN' ? (
        TRUE_FALSE_CHOICES.map((choice) => (
          <SelectableOption key={choice} label={choice} selected={value === choice} onPress={() => onChange(choice)} />
        ))
      ) : question.type === 'YES_NO_NOT_GIVEN' ? (
        YES_NO_CHOICES.map((choice) => (
          <SelectableOption key={choice} label={choice} selected={value === choice} onPress={() => onChange(choice)} />
        ))
      ) : question.type === 'DIAGRAM_LABEL' ? (
        <View>
          {question.imageUrl ? (
            <Image source={{ uri: question.imageUrl }} className="mb-3 h-48 w-full rounded-card" resizeMode="contain" />
          ) : null}
          <Input placeholder="Your answer" value={value ?? ''} onChangeText={onChange} />
        </View>
      ) : (
        <Input placeholder="Your answer" value={value ?? ''} onChangeText={onChange} />
      )}
    </View>
  );
}
