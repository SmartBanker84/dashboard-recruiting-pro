export async function getUserProfile(userId: string) {
  // Dummy implementation per build
  return {
    id: userId,
    full_name: "Esempio Utente",
    email: "utente@example.com",
    role: "manager",
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  // Dummy implementation per build
  return { success: true }
}
