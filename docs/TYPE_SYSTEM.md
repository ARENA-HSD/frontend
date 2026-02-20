# HSD Arena - Type System Documentation

## Overview
Complete TypeScript type system based on HSD Arena Technical Documentation v1.0

## Architecture Principles

### Multi-Tenant "One User, Many Orgs"
- Users create ONE account on `hsdarena.com` (Global Passport)
- Users can belong to MULTIPLE organizations
- Roles are **organization-scoped** (user can be Admin in one org, Manager in another)
- Context switching allows switching between organizations

### Type Organization

```
src/
├── shared/types/
│   └── common.ts              # Cross-feature types
└── features/
    ├── auth/types/
    │   └── auth.types.ts      # Auth, User, Login/Register
    ├── organizations/types/
    │   └── organization.types.ts  # Org CRUD, Members, Branding
    ├── quiz/types/
    │   └── quiz.types.ts      # Quiz, Questions
    └── game/types/
        └── websocket.types.ts # WebSocket events
```

## Key Types

### 1. User & Auth (Global Passport)

**User**: NO role or organization info
```tsx
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}
```

**AuthUser**: User + their organizations
```tsx
interface AuthUser extends User {
  organizations: UserOrganization[]; // All orgs user belongs to
}
```

**AuthContext**: Current selected organization
```tsx
interface AuthContext {
  user: AuthUser;
  currentOrganization: UserOrganization | null;
  role: OrganizationRole | null; // Role in CURRENT org
}
```

### 2. Organizations

**Organization**: Entity
```tsx
interface Organization {
  id: string;
  name: string;
  subdomain: string;
  package: 'FREE' | 'PRO' | 'ENTERPRISE';
  branding: OrganizationBranding;
  ownerId: string; // Super Admin
  createdAt: string;
}
```

**UserOrganization**: Org + user's role
```tsx
interface UserOrganization extends Organization {
  role: OrganizationRole; // SUPER_ADMIN, ADMIN, MANAGER
}
```

### 3. Members (Link Table)

```tsx
interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
}
```

### 4. Quiz & Questions

**Quiz**: Persistent mode setting
```tsx
interface Quiz {
  id: string;
  organizationId: string;
  creatorId: string;
  title: string;
  defaultMode: 'PERSONAL' | 'STAGE'; // CRITICAL: Set once, used for all games
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isDeleted: boolean;
}
```

**Question**: Answer stored as index
```tsx
interface Question {
  id: string;
  quizId: string;
  text: string;
  mediaUrl?: string;
  timeLimit: number;
  points: number;
  orderIndex: number;
  options: string[]; // ["Ankara", "Istanbul", "Izmir", "Bursa"]
  correctIndex: number; // 0 = first option is correct
}
```

### 5. WebSocket Events

**Client → Server**:
```tsx
JoinRoomEvent      // Join lobby
KickPlayerEvent    // Kick (host only)
StartGameEvent     // Start game (host only)
SubmitAnswerEvent  // Submit answer
NextQuestionEvent  // Next question (host only)
```

**Server → Client**:
```tsx
JoinSuccessEvent       // Join confirmed
LobbyUpdateEvent       // Player count (host only)
ForceDisconnectEvent   // Kicked
QuestionStartEvent     // New question
AnswerResultEvent      // Your answer result
ShowScoreboardEvent    // Scoreboard (auto after all answer)
GameOverEvent          // Game finished
ErrorEvent             // Error
```

## Usage Examples

### Register (User Only)
```tsx
const registerData: RegisterData = {
  username: "john_doe",
  email: "john@example.com",
  password: "SecurePass123"
};
// NO organization info!
```

### Create Organization (Separate)
```tsx
const orgData: CreateOrganizationData = {
  name: "HSD Community",
  subdomain: "hsd",
  package: "PRO"
};
```

### Context Switching
```tsx
const switchRequest: SwitchOrganizationRequest = {
  organizationId: "org-uuid-123"
};
// Backend returns new token scoped to this org
```

### WebSocket - Join Game
```tsx
const joinEvent: JoinRoomEvent = {
  type: "JOIN_ROOM",
  data: {
    pin: "482910",
    nickname: "Player1"
  }
};
ws.send(JSON.stringify(joinEvent));
```

### WebSocket - Submit Answer
```tsx
const answerEvent: SubmitAnswerEvent = {
  type: "SUBMIT_ANSWER",
  data: {
    questionId: "question-uuid",
    answerIndex: 0 // First option
  }
};
ws.send(JSON.stringify(answerEvent));
```

## Role Hierarchy

```
SUPER_ADMIN (Owner)
  ├─ Can delete organization
  ├─ Can invite/remove members
  ├─ Can change branding
  └─ All lower permissions

ADMIN (Authorized Manager)
  ├─ Can change branding
  ├─ Can manage quizzes
  └─ All lower permissions

MANAGER (Operational User)
  ├─ Can create/edit quizzes
  ├─ Can manage questions
  └─ Can moderate games
```

## Critical Rules

1. **NO role in User table** - Roles are in `members` table
2. **Quiz.defaultMode is persistent** - NOT asked when starting game
3. **Question.correctIndex** - Doğru cevap index olarak saklanır
4. **Context-based permissions** - User permissions depend on selected org
5. **Cascade deletion** - Owner deleted → Org deleted → Members removed (but users stay)

## Database Mapping

| Frontend Type | Backend Table | Notes |
|--------------|---------------|-------|
| User | users | No org/role info |
| AuthUser | users + members + organizations | Join query |
| Organization | organizations | |
| OrganizationMember | members | Link table |
| Quiz | quizzes | |
| Question | questions | |
| GameSession | Redis game:{pin}:state | Hot storage |

## Import Paths

```tsx
// Shared types
import type { Organization, Quiz, GameMode } from '@/shared/types';

// Feature types
import type { AuthUser, RegisterData } from '@/features/auth/types';
import type { CreateOrganizationData } from '@/features/organizations/types';
import type { CreateQuizData } from '@/features/quiz/types';
import type { JoinRoomEvent, QuestionStartEvent } from '@/features/game/types';
```
