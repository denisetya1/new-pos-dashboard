import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

const LoadingContent = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Item>
      <Spinner className="text-muted-foreground" />
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description !== "" && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
    </Item>
  );
};

export default LoadingContent;
