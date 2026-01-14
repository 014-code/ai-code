export default function access(initialState: { currentUser?: API.LoginUserVO } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canUser: currentUser,
    canAdmin: currentUser && currentUser.userRole === 'admin',
  };
}