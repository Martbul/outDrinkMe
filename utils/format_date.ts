export const formatDateToDayMonthYear = (isoDateString: string | undefined | null) => {
  if (!isoDateString) {
    return "N/A";
  }
  try {
    const date = new Date(isoDateString);
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).toUpperCase(); // 'en-GB' for DD MMM YYYY
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoDateString; // Return original if formatting fails
  }
};
