// MSW 핸들러 — live Swagger 계약 기반 mock 응답
import { http, HttpResponse } from 'msw';

const BASE = '/api/v1';

export const scenariosHandler = http.get(`${BASE}/scenarios`, () => {
  return HttpResponse.json({
    success: true,
    data: {
      categories: [
        {
          categoryId: 1,
          categoryName: 'Free Talk',
          categoryLocked: false,
          categoryLockReason: null,
          scenarios: [
            {
              scenarioId: 1,
              displayOrder: 1,
              scenarioTitle: 'Talk about your food preferences',
              briefing: 'Chat about the foods you love and what you ate recently.',
              conversationGoal: 'Comfortably describe your food tastes and experiences in Korean.',
              completed: false,
              locked: false,
              lockReason: null,
              scenarioEmoji: '🍕',
              firstQuestionPreview: {
                questionId: 100,
                aiQuestion: '가장 좋아하는 음식이 뭐예요? 왜 좋아해요?',
                translatedQuestion: 'What is your favorite food? Why do you like it?',
              },
            },
            {
              scenarioId: 2,
              displayOrder: 2,
              scenarioTitle: 'Talk about your weekend plans',
              briefing: 'Casually talk about what you want to do this coming weekend.',
              conversationGoal: 'Walk through your plans and reasons in Korean.',
              completed: false,
              locked: false,
              lockReason: null,
              scenarioEmoji: '🗓️',
              firstQuestionPreview: {
                questionId: 200,
                aiQuestion: '이번 주말에 뭐 할 계획이에요?',
                translatedQuestion: 'What are you planning to do this weekend?',
              },
            },
            {
              scenarioId: 3,
              displayOrder: 3,
              scenarioTitle: 'Recommend your favorite movie',
              briefing: 'Talk about a movie you love and why you would recommend it.',
              conversationGoal: 'Explain your taste and impressions in Korean.',
              completed: false,
              locked: true,
              lockReason: 'PREVIOUS_SCENARIO_NOT_CLEARED',
              scenarioEmoji: '🎬',
              firstQuestionPreview: null,
            },
          ],
        },
        {
          categoryId: 2,
          categoryName: 'Airport',
          categoryLocked: true,
          categoryLockReason: 'COMING_SOON',
          scenarios: [],
        },
      ],
    },
    error: null,
  });
});

export const startSessionHandler = http.post(
  `${BASE}/scenarios/:scenarioId/sessions`,
  ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          sessionId: 42,
          scenarioId: Number(params.scenarioId),
          totalQuestionCount: 3,
          currentTurn: {
            turnId: 101,
            sequence: 1,
            aiQuestion: '가장 좋아하는 음식이 뭐예요? 왜 좋아해요?',
            translatedQuestion: 'What is your favorite food? Why do you like it?',
          },
          progress: {
            currentSequence: 1,
            totalQuestionCount: 3,
            completed: false,
          },
        },
        error: null,
      },
      { status: 201 },
    );
  },
);

let utteranceCount = 0;
export const submitUtteranceHandler = http.post(
  `${BASE}/sessions/:sessionId/utterances`,
  () => {
    utteranceCount += 1;
    const sequence = utteranceCount;
    const completed = sequence >= 3;
    const nextSequence = sequence + 1;

    // 종료 시에도 속마음은 non-null, nextTurn에 AI 마무리 멘트가 실려 옴
    const innerThought = completed
      ? 'Your last answer was clear too. A natural wrap-up would be nice.'
      : sequence === 1
      ? 'Oh, they like spicy pizza and gave the reason right away — easy to talk with.'
      : 'Hmm, so they do not cook it themselves. Fair enough.';
    const innerThoughtType = completed ? 'GOOD' : sequence === 1 ? 'GOOD' : 'NORMAL';

    const response = HttpResponse.json({
      success: true,
      data: {
        submittedTurn: {
          turnId: 100 + sequence,
          sequence,
          turnFeedbackStatus: 'PREPARING',
          innerThought,
          innerThoughtType,
        },
        nextTurn: completed
          ? {
              turnId: 100 + nextSequence,
              sequence: nextSequence,
              aiQuestion: '이야기 들려줘서 고마워요. 정말 좋은 대화였어요!',
              translatedQuestion: 'Thanks for sharing. That was a great chat!',
            }
          : {
              turnId: 100 + nextSequence,
              sequence: nextSequence,
              aiQuestion: sequence === 1
                ? '보통 직접 요리해서 드세요?'
                : '그 음식을 마지막으로 언제 먹었어요?',
              translatedQuestion: sequence === 1
                ? 'Do you usually cook it yourself?'
                : 'When did you last eat it?',
            },
        progress: {
          currentSequence: nextSequence,
          totalQuestionCount: 3,
          completed,
        },
      },
      error: null,
    });

    if (completed) utteranceCount = 0;

    return response;
  },
);

export const feedbackHandler = http.post(
  `${BASE}/sessions/:sessionId/feedback`,
  ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        sessionId: Number(params.sessionId),
        nativeScore: 82,
        highlightMessage: 'You pushed through and got your full point across.',
        turnFeedbacks: [
          {
            turnId: 101,
            sequence: 1,
            originalQuestion: '가장 좋아하는 음식이 뭐예요? 왜 좋아해요?',
            translatedQuestion: 'What is your favorite food? Why do you like it?',
            userUtterance: '저는 피자 좋아해요. 매워서 좋아해요.',
            feedbackType: 'GOOD',
            koreanAnalogy: 'It sounds like you cleanly tacked on the reason.',
            positiveFeedback: null,
            feedbackDetail: 'Because you linked your favorite food and the reason in one clear sentence.',
            correctionExpression: null,
            correctionReason: null,
            benchmarkMessage: 'Most beginners drop the reason — you added it perfectly.',
          },
          {
            turnId: 102,
            sequence: 2,
            originalQuestion: '보통 직접 요리해서 드세요?',
            translatedQuestion: 'Do you usually cook it yourself?',
            userUtterance: '요리 안 해요. 밖에서 사요.',
            feedbackType: 'NEEDS_IMPROVEMENT',
            koreanAnalogy: 'The meaning gets through, but it sounds like words strung together.',
            positiveFeedback: 'Your intent — that you do not cook yourself — came through clearly.',
            feedbackDetail: null,
            correctionExpression: '아니요, 보통 식당에서 사 먹어요.',
            correctionReason: 'Adding the verb and saying it as a full sentence sounds much more natural.',
            benchmarkMessage: null,
          },
        ],
      },
      error: null,
    });
  },
);

export const abandonSessionHandler = http.patch(
  `${BASE}/sessions/:sessionId/abandon`,
  () => {
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
    });
  },
);

export const handlers = [
  scenariosHandler,
  startSessionHandler,
  submitUtteranceHandler,
  feedbackHandler,
  abandonSessionHandler,
];
