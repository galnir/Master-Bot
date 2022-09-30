import React from 'react';
import { trpc } from '../../utils/trpc';

const WelcomeMessageInput = ({ guildId }: { guildId: string }) => {
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { mutate } = trpc.welcome.setMessage.useMutation();
  const { data } = trpc.welcome.getMessage.useQuery({ guildId });

  function handleSubmit() {
    setIsSubmitting(true);
    mutate(
      {
        guildId,
        message
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        }
      }
    );
  }

  return (
    <div>
      <textarea
        name="welcome_message"
        placeholder="welcome message input"
        value={message}
        defaultValue={data?.message ? data.message : 'Loading...'}
        onChange={e => setMessage(e.target.value)}
        className="block -ml-1 w-full bg-black outline-none overflow-auto my-2 resize-none p-4 text-white rounded-lg border border-gray-800 focus:ring-blue-600 focus:border-blue-600"
      />
      <button
        className="mt-1 -mb-1 p-1 px-2 rounded-sm text-white bg-blue-800 hover:bg-blue-900"
        type="submit"
        onClick={handleSubmit}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
};

export default WelcomeMessageInput;
