import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NewEventDialog from "./new-event-dialog";
import { useStore } from "@/store/store";

const UserSection = (props: { username: string }) => {
  const { user } = useStore();
  const username = props.username || user?.username;
  // Use the main frontend URL since both services are serving frontend
  const my_link = `https://meetly-main.onrender.com/${username}`;
  return (
    <div
      className="w-full flex flex-wrap items-center justify-between 
    mb-5 border-b border-[#D4E162] "
    >
      <div className="flex items-center p-[16px_0_8px] gap-3">
        <div className="w-[54px] h-[54px] flex items-center justify-center">
          <Avatar className="!w-[45px] !h-[45px] !p-px border-2 border-[#CCCCCC] transition-colors">
            <AvatarFallback className="bg-[#e7edf6] uppercase">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <span
              className="block max-w-[340px] capitalize whitespace-nowrap 
            overflow-hidden truncate line-clamp-1 text-sm font-normal"
            >
              {user?.name}
            </span>
          </div>
          <div className="flex">
            <a target="_blank" href={my_link} className="text-[#004eba]">
              <span
                className="block max-w-[340px] whitespace-nowrap 
            overflow-hidden truncate line-clamp-1 text-sm font-normal"
              >
                {my_link}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* {Create Event } */}
      <div className="flex items-center p-[18px_0]">
        <NewEventDialog />
      </div>
    </div>
  );
};

export default UserSection;
