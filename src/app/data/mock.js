export const MOCK_BOOKS = [
    {
        id: '1',
        title: 'Тайны древнего кода',
        author: 'Алексей Иванов',
        rating: 4.8,
        reviewsCount: 124,
        cover: 'https://cdn.litres.ru/pub/c/cover_415/16953689.webp',
        tags: ['Киберпанк', 'Детектив'],
        genre: 'Фантастика',
        year: 2024,
        isFree: true,
        description: 'В мире, где информация стала ценнее золота, один хакер находит код, способный изменить реальность.'
    },
    {
        id: '2',
        title: 'Ветер перемен',
        author: 'Мария Петрова',
        rating: 4.5,
        reviewsCount: 89,
        cover: 'https://cdn.litres.ru/pub/c/cover_415/69538882.jpg',
        tags: ['Романтика', 'Драма'],
        genre: 'Проза',
        year: 2023,
        isFree: false,
        description: 'История о поиске себя в стремительно меняющемся мире постмодерна.'
    },
    {
        id: '3',
        title: 'Забытые миры',
        author: 'Дмитрий Соколов',
        rating: 4.9,
        reviewsCount: 256,
        cover: 'https://vse-svobodny.com/wp-content/uploads/2025/12/%D0%9D%D0%B5%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D1%8B%D0%B9-%D0%BC%D0%B8%D1%80-scaled.jpg',
        tags: ['Эпическое фэнтези'],
        genre: 'Фэнтези',
        year: 2025,
        isFree: true,
        description: 'Древние боги пробуждаются, и только один человек может остановить грядущий хаос.'
    },
    {
        id: '4',
        title: 'Алгоритмы жизни',
        author: 'Елена Кузнецова',
        rating: 4.2,
        reviewsCount: 45,
        cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxtYYpvlDXC1mMaMDTJOTHqEZBzGOEKQN9yw&s',
        tags: ['Научпоп', 'Психология'],
        genre: 'Образование',
        year: 2024,
        isFree: false,
        description: 'Как наш мозг принимает решения и можно ли запрограммировать счастье?'
    },
    {
        id: '5',
        title: 'Тени прошлого',
        author: 'Виктор Смирнов',
        rating: 4.7,
        reviewsCount: 167,
        cover: 'https://cdn.azbooka.ru/cv/w1100/c417988a-a1e5-4cdf-accb-c5c1dc63f65d.jpg',
        tags: ['Триллер', 'Мистика'],
        genre: 'Детектив',
        year: 2022,
        isFree: true,
        description: 'Старый заброшенный дом хранит тайны, о которых лучше было бы забыть.'
    },
];
export const MOCK_REVIEWS = [
    {
        id: '1',
        bookId: '1',
        userId: 'user1',
        userName: 'Иван Петров',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop',
        rating: 5,
        text: 'Потрясающая книга! Сюжет держит в напряжении до последней страницы. Автор мастерски создал атмосферу киберпанка.',
        date: '2026-02-15',
        likes: 24,
        dislikes: 1
    },
    {
        id: '2',
        bookId: '1',
        userId: 'user2',
        userName: 'Анна Смирнова',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop',
        rating: 4,
        text: 'Хорошая книга, но концовка показалась немного предсказуемой. В целом рекомендую!',
        date: '2026-02-10',
        likes: 12,
        dislikes: 3
    },
    {
        id: '3',
        bookId: '1',
        userId: 'user3',
        userName: 'Дмитрий Козлов',
        userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop',
        rating: 5,
        text: 'Лучшее, что я читал за последний год! Обязательно буду следить за новыми работами автора.',
        date: '2026-02-18',
        likes: 35,
        dislikes: 0
    },
    {
        id: '4',
        bookId: '2',
        userId: 'user4',
        userName: 'Елена Волкова',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop',
        rating: 4,
        text: 'Красивая история о поиске себя. Местами немного затянуто, но финал того стоит.',
        date: '2026-02-12',
        likes: 18,
        dislikes: 2
    },
    {
        id: '5',
        bookId: '3',
        userId: 'user5',
        userName: 'Александр Новиков',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop',
        rating: 5,
        text: 'Эпическое фэнтези в лучших традициях жанра! Мир проработан до мельчайших деталей.',
        date: '2026-02-19',
        likes: 42,
        dislikes: 1
    }
];
