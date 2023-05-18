import useDebounce from "@/hook/debounce";
import useInputValue from "@/hook/input_value";
import { theme } from "@/styles/theme";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";

const LineCardComponent = ({
  lineCode,
  trainList,
}: {
  lineCode: number;
  trainList: any;
}) => {
  const filteredTrainList = trainList.filter(
    (list: any) => list.lineNum === lineCode
  );

  const directionA = [...filteredTrainList].filter(
    (list: any) => list.direction === filteredTrainList[0].direction
  );
  const directionB = [...filteredTrainList].filter(
    (list: any) =>
      list.direction ===
      filteredTrainList[filteredTrainList.length - 1].direction
  );

  return (
    <LineCard>
      <div className="lineName">{lineCode}호선</div>
      <div className="directionList">
        <div className="direction">
          <div className="listTitle">{directionA[0].direction}</div>
          {directionA.map((list: any) => {
            return (
              <div key={list.trainNum} className="listBox">
                <div>{list.destination}</div>
                <div>{list.currentLocation}</div>
                <div>{list.limit}</div>
              </div>
            );
          })}
        </div>
        <div className="direction">
          <div className="listTitle">{directionB[0].direction}</div>
          {directionB.map((list: any) => {
            return (
              <div key={list.trainNum} className="listBox">
                <div>{list.destination}</div>
                <div>{list.currentLocation}</div>
                <div>{list.limit}</div>
              </div>
            );
          })}
        </div>
      </div>
    </LineCard>
  );
};
export default function Home() {
  const { inputValue, changeValue } = useInputValue();
  const [realTime, setRealTime] = useState<any[]>([]);
  const [stationLineArr, setStationLineArr] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [autoCompleteArr, setAutoCompleteArr] = useState<string[]>([]);

  const [toilet, setToilet] = useState([]);
  const [toiletError, setToiletError] = useState<string>("");

  const debouncedValue = useDebounce(inputValue, 200);

  const [inputFocus, setInputFocus] = useState(false);

  //자동완성
  const activeAutoCompleteList = async (inputValue: string) => {
    const result = await axios.get(`/api/autocomplete/${inputValue}`);
    setAutoCompleteArr(result.data.autoComplete);
  };
  useEffect(() => {
    if (!debouncedValue) {
      setAutoCompleteArr([]);
    } else {
      activeAutoCompleteList(debouncedValue);
    }
  }, [debouncedValue]);
  const activeAutoComplete = (list: string) => {
    changeValue(list);
    getStationData(list);
    setAutoCompleteArr([]);
  };
  //역 데이터 불러오기
  const getStationData = async (inputValue: string) => {
    setInputFocus(false);
    const result = await axios.get(`/api/station/${inputValue}`);
    setErrorMessage("");
    setStationLineArr(result.data.lineNumArr);
    setRealTime(result.data.lineData);

    setToiletError("");
    setToilet(result.data.toiletData);
  };

  return (
    <Wrap>
      <header>
        <h1>about station</h1>
      </header>
      <main>
        <InputSection>
          <div className="inputSectionBox">
            <div className="inputSection">
              <input
                type="text"
                placeholder="ex) 성수"
                value={inputValue}
                onChange={(e: any) => {
                  changeValue(e.target.value);
                }}
                onFocus={() => {
                  setInputFocus(true);
                }}
                onBlur={(e: any) => {
                  if (!e.relatedTarget) {
                    setInputFocus(false);
                  }
                }}
                onKeyDown={(e: any) => {
                  if (!e.nativeEvent.isComposing && e.code === "Enter") {
                    getStationData(inputValue);
                  }
                }}
              />
              <button
                onClick={() => {
                  getStationData(inputValue);
                }}
              >
                검색
              </button>
            </div>
            {inputFocus && autoCompleteArr.length !== 0 && (
              <ul className="autocomplete">
                {autoCompleteArr.map((list) => {
                  return (
                    <li
                      key={list}
                      onClick={() => {
                        activeAutoComplete(list);
                      }}
                      tabIndex={-1}
                    >
                      {list}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </InputSection>
        <ResultSection>
          <article className="realTime">
            <div className="title">실시간 도착 정보</div>
            {!errorMessage ? (
              <ul>
                {stationLineArr.map((list) => {
                  return (
                    <LineCardComponent
                      key={list}
                      lineCode={list}
                      trainList={realTime}
                    />
                  );
                })}
              </ul>
            ) : (
              <span>{errorMessage}</span>
            )}
          </article>
          <article className="toilet">
            <div className="title">화장실 정보</div>
            {!toiletError ? (
              toilet.map((list: any) => (
                <div key={list.lineNum}>
                  <div>{list.lineName}</div>
                  <div>{list.location}</div>
                  <div>{list.inAndOut}</div>
                </div>
              ))
            ) : (
              <div>{toiletError}</div>
            )}
          </article>
        </ResultSection>
      </main>
    </Wrap>
  );
}

const Wrap = styled.div`
  color: ${theme.textColor.bright};
  background-color: ${theme.backgroundColor.bright};
  width: 100%;
  header {
    background-color: #8d8d8d;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
  }
  header h1 {
    color: white;
    font-weight: 500;
    font-size: 17px;
    margin-left: 10px;
  }
  main {
    margin: 10px;
  }
  main input {
    padding: 0;
  }
  article {
    margin: 10px 0;
  }
`;
const InputSection = styled.section`
  position: relative;
  height: 40px;
  .inputSectionBox {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border: 1px solid gray;
    border-radius: 25px;
    background-color: white;
  }
  .inputSection {
    height: 40px;
    border-radius: 30px;
    overflow: hidden;
    font-size: 17px;
    display: flex;
    align-items: center;
  }
  input {
    width: 100%;
    height: 100%;
    margin: 10px;
    border: none;
    background-color: transparent;
    outline: none;
  }
  button {
    width: 100px;
    height: 100%;
    color: white;
    margin: 0;
    padding: 0;
    border: none;
    background-color: gray;
  }
  .autocomplete {
    margin: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .autocomplete li {
    cursor: pointer;
  }
`;
const ResultSection = styled.section`
  .title {
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
  }
  ul {
    width: 90%;
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
`;

const LineCard = styled.li`
  width: 100%;
  padding: 10px;
  border: 1px solid black;
  .directionList {
    display: flex;
  }
  .direction {
    width: 50%;
  }
  .listTitle {
    margin-bottom: 5px;
    font-weight: bold;
  }
  .listBox {
    margin-bottom: 10px;
  }
`;
