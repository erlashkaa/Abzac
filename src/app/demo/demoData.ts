import type { Book } from '../api/booksApi';
import type { Review } from '../api/reviewsApi';
import type { UserPublicProfile, UserProfileResponse } from '../api/usersApi';

// NOTE: Это только фронтенд-демо данные. Используются как fallback,
// когда backend пустой/недоступен, чтобы UI выглядел "живым".

export const DEMO_USERS: UserPublicProfile[] = [
  {
    id: 9001,
    username: 'Иван Петров',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=180&h=180&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?q=80&w=1400&auto=format&fit=crop',
    about: 'Product designer. Читаю научпоп и фантастику, выписываю мысли в заметки. Люблю короткие главы и ясную структуру.',
    role: 'user',
    created_at: '2025-09-14T10:00:00.000Z',
  },
  {
    id: 9002,
    username: 'Анна Смирнова',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=180&h=180&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1522881451255-f59ad836fdfb?q=80&w=1400&auto=format&fit=crop',
    about: 'Редактор и любительница эссе. Если книга слабая — скажу честно, но бережно. Сильные тексты рекомендую друзьям.',
    role: 'user',
    created_at: '2025-11-02T10:00:00.000Z',
  },
  {
    id: 9003,
    username: 'Дмитрий Козлов',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=180&h=180&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop',
    about: 'Разработчик. Оцениваю книги по плотности идей и качеству концовки. В фэнтези люблю мироустройство, в детективе — логику.',
    role: 'user',
    created_at: '2026-01-08T10:00:00.000Z',
  },
  {
    id: 9004,
    username: 'Елена Волкова',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=180&h=180&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1523437237164-d442d57cc3c9?q=80&w=1400&auto=format&fit=crop',
    about: 'Психолог. Читаю медленно и вдумчиво, собираю цитаты. Могу спорить в комментариях, но всегда по делу.',
    role: 'user',
    created_at: '2025-12-21T10:00:00.000Z',
  },
  {
    id: 9005,
    username: 'Александр Новиков',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=180&h=180&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?q=80&w=1400&auto=format&fit=crop',
    about: 'Люблю длинные серии и “эпик”. Триггеры не спойлерю — помечаю. Веду читательский дневник.',
    role: 'user',
    created_at: '2025-08-03T10:00:00.000Z',
  },
];

export const DEMO_BOOKS: Book[] = [
  {
    id: 91001,
    title: 'Тайны древнего кода',
    author: 'Алексей Иванов',
    rating: 4.8,
    reviews_count: 124,
    cover: 'https://cdn.litres.ru/pub/c/cover_415/16953689.webp',
    tags: ['киберпанк', 'детектив'],
    genre: 'Фантастика',
    year: 2024,
    is_free: true,
    description: 'Хакер находит фрагмент кода, который “переписывает” реальность — и понимает, что за ним уже охотятся.',
    content:
      'Город светился холодным неоном, будто кто-то забыл выключить лабораторию.\n\n' +
      'Я открыл файл и увидел строки, которые не должны существовать. Они были слишком… правильными.\n\n' +
      'Если этот код работает — значит, мир тоже всего лишь программа.',
    created_at: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 91002,
    title: 'Ветер перемен',
    author: 'Мария Петрова',
    rating: 4.5,
    reviews_count: 89,
    cover: 'https://cdn.litres.ru/pub/c/cover_415/69538882.jpg',
    tags: ['эссе', 'драма'],
    genre: 'Проза',
    year: 2023,
    is_free: false,
    description: 'История о том, как перестать “успевать” и начать жить: тихо, честно и без показной мотивации.',
    content:
      'Иногда перемены начинаются не с решения, а с усталости.\n\n' +
      'Ты перестаёшь спорить с собой — и выбираешь простое: одну цель, один день, один шаг.\n\n' +
      'И внезапно воздух становится легче.',
    created_at: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 91003,
    title: 'Забытые миры',
    author: 'Дмитрий Соколов',
    rating: 4.9,
    reviews_count: 256,
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop',
    tags: ['эпик', 'мифология'],
    genre: 'Фэнтези',
    year: 2025,
    is_free: true,
    description: 'Древние боги просыпаются, и у мира остаётся только один шанс: человек, который не верит в чудеса.',
    content:
      'Когда легенды просыпаются, люди вспоминают страх.\n\n' +
      'Но страх — плохой советчик. Он делает шаги громкими и мысли узкими.\n\n' +
      'Я выбрал тишину. И услышал, как мир трещит по швам.',
    created_at: '2026-02-04T10:00:00.000Z',
  },
  {
    id: 91004,
    title: 'Алгоритмы жизни',
    author: 'Елена Кузнецова',
    rating: 4.2,
    reviews_count: 45,
    cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop',
    tags: ['научпоп', 'психология'],
    genre: 'Образование',
    year: 2024,
    is_free: false,
    description: 'Как мозг принимает решения, почему мы ошибаемся — и можно ли построить привычки как систему.',
    content:
      'Мы не “ленивые”. Мы экономим усилие.\n\n' +
      'Привычка — это компрессия: мозг сохраняет путь, чтобы больше не думать.\n\n' +
      'Вопрос только в том, кто пишет этот путь: вы или случайность.',
    created_at: '2026-02-05T10:00:00.000Z',
  },
  {
    id: 91005,
    title: 'Тени прошлого',
    author: 'Виктор Смирнов',
    rating: 4.7,
    reviews_count: 167,
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=900&auto=format&fit=crop',
    tags: ['триллер', 'мистика'],
    genre: 'Детектив',
    year: 2022,
    is_free: true,
    description: 'Заброшенный дом хранит тайны, которые лучше не поднимать на поверхность. Но герой всё равно войдёт.',
    content:
      'Дом стоял, как пауза в разговоре.\n\n' +
      'Внутри было слишком чисто — будто кто-то убрался перед тем, как исчезнуть.\n\n' +
      'Я нашёл ключ под ковриком. И это было самым неправильным в этой истории.',
    created_at: '2026-02-06T10:00:00.000Z',
  },
];

const userById = (id: number) => DEMO_USERS.find((u) => u.id === id);
const userAvatar = (id: number) => userById(id)?.avatar || '';
const userName = (id: number) => userById(id)?.username || 'Пользователь';

export const DEMO_REVIEWS_BY_BOOK: Record<number, Review[]> = {
  91001: [
    {
      id: 99001,
      book_id: 91001,
      book_title: 'Тайны древнего кода',
      user_id: 9001,
      user_name: userName(9001),
      user_avatar: userAvatar(9001),
      rating: 5,
      text: 'Сюжет держит темп, а мир — цельный. Понравилось, что “технологии” не ради декора, а реально влияют на конфликт.',
      likes: 24,
      dislikes: 1,
      liked_by_user: false,
      disliked_by_user: false,
      created_at: '2026-02-15T12:00:00.000Z',
    },
    {
      id: 99002,
      book_id: 91001,
      book_title: 'Тайны древнего кода',
      user_id: 9002,
      user_name: userName(9002),
      user_avatar: userAvatar(9002),
      rating: 4,
      text: 'Сильное начало и хороший темп. Финал предсказуемый, но читать приятно — язык чистый.',
      likes: 12,
      dislikes: 3,
      liked_by_user: false,
      disliked_by_user: false,
      created_at: '2026-02-10T12:00:00.000Z',
    },
    {
      id: 99003,
      book_id: 91001,
      book_title: 'Тайны древнего кода',
      user_id: 9003,
      user_name: userName(9003),
      user_avatar: userAvatar(9003),
      rating: 5,
      text: 'Лучшее за сезон. Отличная развязка и нормальная логика причин/следствий, без “магии ради магии”.',
      likes: 35,
      dislikes: 0,
      liked_by_user: false,
      disliked_by_user: false,
      created_at: '2026-02-18T12:00:00.000Z',
    },
  ],
  91002: [
    {
      id: 99004,
      book_id: 91002,
      book_title: 'Ветер перемен',
      user_id: 9004,
      user_name: userName(9004),
      user_avatar: userAvatar(9004),
      rating: 4,
      text: 'Тихая и честная вещь. Понравились наблюдения — без дешёвой мотивации и “успешного успеха”.',
      likes: 18,
      dislikes: 2,
      liked_by_user: false,
      disliked_by_user: false,
      created_at: '2026-02-12T12:00:00.000Z',
    },
  ],
  91003: [
    {
      id: 99005,
      book_id: 91003,
      book_title: 'Забытые миры',
      user_id: 9005,
      user_name: userName(9005),
      user_avatar: userAvatar(9005),
      rating: 5,
      text: 'Мироустройство — топ. Чувствуется “масштаб”, и при этом персонажи не картонные. Очень рекомендую.',
      likes: 42,
      dislikes: 1,
      liked_by_user: false,
      disliked_by_user: false,
      created_at: '2026-02-19T12:00:00.000Z',
    },
  ],
};

export const getDemoBook = (id: number) => DEMO_BOOKS.find((b) => b.id === id) || null;
export const getDemoReviews = (bookId: number) => DEMO_REVIEWS_BY_BOOK[bookId] || [];

export const getDemoUserProfile = (userId: number): UserProfileResponse | null => {
  const user = userById(userId);
  if (!user) return null;

  const reviews = Object.values(DEMO_REVIEWS_BY_BOOK)
    .flat()
    .filter((r) => r.user_id === userId);

  return {
    user,
    reviews,
    comments: [],
    topics: [],
  };
};

/** Только для fallback при недоступном API — не вызывать при успешном ответе с реальными книгами */
export const mergeWithDemoBooks = (real: Book[], { targetSize = 10 } = {}) => {
  const seen = new Set<number>(real.map((b) => b.id));
  const fill = DEMO_BOOKS.filter((b) => !seen.has(b.id));
  const merged = [...real, ...fill];
  return merged.slice(0, Math.max(targetSize, real.length));
};

export const isDemoId = (id: number) => id >= 9000;

