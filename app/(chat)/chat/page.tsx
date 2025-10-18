import { Chat } from '@/components/chat';
import { getAuthTokenServer } from '@/lib/auth-server';


export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const token = await getAuthTokenServer();
   if (!token) {
        return null
      }
  return (
    <>
      <Chat
        id={id}
        initialVisibilityType="private"
        isReadonly={false}
      />
    </>
  );
}
