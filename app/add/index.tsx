import { AppScreen, CloseIconButton } from '@/components';

import { StepDots } from './_components/step-dots';
import { STEP_TITLES } from './_constants';
import { useAddVisitForm } from './_hooks/use-add-visit-form';
import { StepComplete } from './_steps/step-complete';
import { StepCountry } from './_steps/step-country';
import { StepDetails } from './_steps/step-details';
import { StepMemoFill } from './_steps/step-memo-fill';
import { StepMemoPick } from './_steps/step-memo-pick';
import { StepPhotos } from './_steps/step-photos';

export default function AddVisitScreen() {
  const form = useAddVisitForm();
  const {
    step,
    setStep,
    countryId,
    countryQuery,
    setCountryQuery,
    filter,
    setFilter,
    visitedAt,
    isDatePickerOpen,
    toggleDatePicker,
    handleDateChange,
    cityInput,
    setCityInput,
    cityNames,
    photoUris,
    selectedMemoTypes,
    memoContents,
    isSaving,
    selectedCountry,
    isPremium,
    visitCountByCountry,
    countries,
    selectCountry,
    addCity,
    removeCity,
    pickPhotos,
    removePhoto,
    toggleMemo,
    setMemoContent,
    goNextFromDetails,
    saveVisit,
    finish,
    close,
  } = form;

  return (
    <AppScreen
      title={STEP_TITLES[step]}
      subtitle={`訪問記録の追加 ${Math.min(step + 1, STEP_TITLES.length)} / ${STEP_TITLES.length}`}
      right={<CloseIconButton onPress={close} />}
    >
      <StepDots step={step} />

      {step === 0 ? (
        <StepCountry
          countries={countries}
          countryId={countryId}
          visitCountByCountry={visitCountByCountry}
          countryQuery={countryQuery}
          onChangeQuery={setCountryQuery}
          filter={filter}
          onChangeFilter={setFilter}
          onSelectCountry={selectCountry}
        />
      ) : null}

      {step === 1 && selectedCountry ? (
        <StepDetails
          selectedCountry={selectedCountry}
          nextVisitOrdinal={(visitCountByCountry[selectedCountry.id] ?? 0) + 1}
          visitedAt={visitedAt}
          isDatePickerOpen={isDatePickerOpen}
          onToggleDatePicker={toggleDatePicker}
          onDateChange={handleDateChange}
          cityInput={cityInput}
          cityNames={cityNames}
          onChangeCityInput={setCityInput}
          onAddCity={addCity}
          onRemoveCity={removeCity}
          onNext={goNextFromDetails}
        />
      ) : null}

      {step === 2 ? (
        <StepPhotos
          isPremium={isPremium}
          photoUris={photoUris}
          onPickPhotos={pickPhotos}
          onRemovePhoto={removePhoto}
          onNext={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <StepMemoPick
          selectedMemoTypes={selectedMemoTypes}
          onToggleMemo={toggleMemo}
          onNext={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <StepMemoFill
          selectedMemoTypes={selectedMemoTypes}
          memoContents={memoContents}
          onChangeMemoContent={setMemoContent}
          isSaving={isSaving}
          onSave={saveVisit}
        />
      ) : null}

      {step === 5 && selectedCountry ? (
        <StepComplete
          selectedCountry={selectedCountry}
          visitedAt={visitedAt}
          cityNames={cityNames}
          onFinish={finish}
        />
      ) : null}
    </AppScreen>
  );
}
