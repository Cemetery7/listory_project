export function isSelfFollow(followerId: string, authorId: string) {
  return followerId === authorId;
}
